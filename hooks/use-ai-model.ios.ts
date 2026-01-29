import { ModelOptions } from "@/types/model";

import { apple } from "@react-native-ai/apple";
import { llama } from "@react-native-ai/llama";
import { streamText } from "ai";

import { SYSTEM_PROMPT, useAIModelState } from "./use-ai-model.shared";

export function useAIModel() {
  const {
    isLoading,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputText,
    setIsLoading,
    resetStreamingState,
    appendReasoning,
    appendOutput,
    setDownloadProgress,
    setIsDownloading,
    abortRef,
  } = useAIModelState();

  const cancelGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setIsDownloading(false);
  };

  const generateNote = async (
    model: ModelOptions,
    prompt: string,
    images?: string[],
  ) => {
    resetStreamingState();
    setIsLoading(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const appendChunk = (delta: unknown) => {
      if (typeof delta === "string") {
        appendOutput(delta);
      } else if (typeof (delta as { text?: string })?.text === "string") {
        appendOutput((delta as { text: string }).text);
      }
    };
    switch (model) {
      case "apple":
        {
          try {
            const {
              textStream: appleTextStream,
              reasoning: appleReasoning,
              totalUsage: appleTotalUsage,
            } = streamText({
              model: apple(),
              system: SYSTEM_PROMPT,
              prompt,
              abortSignal: abortRef.current?.signal,
              onAbort: () => {
                appendOutput("\n\nGeneration cancelled by user.");
              },
              // NOTE: add images to the provider input when the SDK supports it on iOS.
            });

            const consumeReasoning = (async () => {
              const appleReasoningOutput = await appleReasoning;
              for (const delta of appleReasoningOutput) {
                if (delta?.text) {
                  console.log("apple reasoning:", delta);
                  appendReasoning(delta.text);
                }
              }
            })();

            const consumeText = (async () => {
              for await (const delta of appleTextStream) {
                console.log("apple output:", delta);
                appendChunk(delta);
              }
            })();

            const consumeTotalUsage = (async () => {
              const usage = await appleTotalUsage;
              console.log("apple usage", usage);
            })();

            await Promise.all([
              consumeReasoning,
              consumeText,
              consumeTotalUsage,
            ]);
          } catch (error) {
            console.log("Error during Apple model processing:", error);
          }
        }
        break;

      case "llama":
        // Create model instance (Model ID format: "owner/repo/filename.gguf")
        const modelLlama = llama.languageModel(
          "ggml-org/SmolLM3-3B-GGUF/SmolLM3-Q4_K_M.gguf",
        );
        try {
          const isDownloaded = await modelLlama.isDownloaded();
          console.log("LLaMA model isDownloaded:", isDownloaded);
          if (!isDownloaded) {
            setIsDownloading(true);
            // Download from HuggingFace (with progress)
            await modelLlama.download((progress) => {
              setDownloadProgress(progress.percentage);
              console.log(`Downloading: ${progress.percentage}%`);
            });

            setIsDownloading(false);
          }

          // Initialize model (loads into memory)
          await modelLlama.prepare();

          // Generate text
          const { textStream, reasoning, providerMetadata, totalUsage } =
            streamText({
              model: modelLlama,
              system: SYSTEM_PROMPT,
              prompt,
              abortSignal: abortRef.current?.signal,
              onAbort: () => {
                appendOutput("\n\nGeneration cancelled by user.");
              },
            });

          const consumeReasoning = (async () => {
            const reasoningOutput = await reasoning;
            for (const delta of reasoningOutput) {
              if (delta?.text) {
                console.log("llama reasoning:", delta);
                appendReasoning(delta.text);
              }
            }
          })();

          const consumeText = (async () => {
            for await (const delta of textStream) {
              console.log("llama output:", delta);
              appendChunk(delta);
            }
          })();

          const consumeMetaData = (async () => {
            const data = await providerMetadata;

            console.log("data", data);
          })();

          const consumeTotalUsage = (async () => {
            const usage = await totalUsage;

            console.log("usage", usage);
          })();

          await Promise.all([
            consumeReasoning,
            consumeText,
            consumeMetaData,
            consumeTotalUsage,
          ]);

          // Cleanup when done
          await modelLlama.unload();
        } catch (err) {
          console.log("Error during LLaMA model processing:", err);
          appendOutput(
            "An error occurred while processing the LLaMA model. Please try again.",
          );
          // Cleanup when done
          try {
            await modelLlama.unload();
          } catch {}
        }

        break;
      default:
        break;
    }

    abortRef.current = null;
    setIsLoading(false);
  };

  return {
    isLoading,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputText,
    generateNote,
    cancelGeneration,
  };
}
