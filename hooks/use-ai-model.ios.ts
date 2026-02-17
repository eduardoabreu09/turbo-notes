import { Asset } from "@/types/asset";
import { apple } from "@react-native-ai/apple";
import { streamText } from "ai";
import { useState } from "react";
import { runOnJS } from "react-native-worklets";
import {
  SYSTEM_PROMPT,
  appendStreamChunk,
  mapAssetToMessage,
  runLlamaGeneration,
  useAIModelState,
} from "./use-ai-model.shared";
import { useModelCatalogGeneration } from "./use-model-catalog";

export function useAIModel() {
  const {
    isGenerating,
    reasoningLog,
    outputStreamText,
    outputText,
    abortRef,
    setIsGenerating,
    resetStreamingState,
    flushStreamingBuffers,
    appendReasoning,
    appendOutputStream,
    setOutputText,
    cancelGeneration,
  } = useAIModelState();
  const {
    resolveForGeneration,
    buildLlamaRuntime,
    ensureDownloaded,
    handleCorruptedModel,
  } = useModelCatalogGeneration();
  const [activeModelKey, setActiveModelKey] = useState<string | undefined>();
  const [activeModelLabel, setActiveModelLabel] = useState<
    string | undefined
  >();
  const [generatedModelKey, setGeneratedModelKey] = useState<
    string | undefined
  >();

  // TODO: test performance with worklet
  const generateNote = async (
    modelKey: string | undefined,
    prompt: string,
    photos?: Asset[],
  ) => {
    runOnJS(_generateNote)(modelKey, prompt, photos);
  };

  const _generateNote = async (
    modelKey: string | undefined,
    prompt: string,
    photos?: Asset[],
  ) => {
    "worklet";
    resetStreamingState();
    setOutputText("");
    setGeneratedModelKey(undefined);
    setIsGenerating(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const hasMedia = Boolean(photos?.length);
      const selectedModel = resolveForGeneration(modelKey, hasMedia);
      const abortSignal = abortRef.current?.signal;

      if (!selectedModel) {
        setOutputText("No model available. Add or download a model first.");
        return;
      }
      setActiveModelKey(selectedModel.key);
      setActiveModelLabel(selectedModel.label);
      setGeneratedModelKey(selectedModel.key);

      switch (selectedModel.provider) {
        case "apple": {
          if (!apple.isAvailable()) {
            setOutputText(
              "Apple Intelligence is not available on this device. Select another model.",
            );
            break;
          }

          const fileMessage = mapAssetToMessage(photos || []);
          const messages = [
            { role: "user" as const, content: prompt },
            ...(fileMessage.length > 0
              ? [{ role: "user" as const, content: fileMessage }]
              : []),
          ];

          try {
            const {
              textStream: appleTextStream,
              reasoning: appleReasoning,
              totalUsage: appleTotalUsage,
              text: appleText,
            } = streamText({
              model: apple(),
              system: SYSTEM_PROMPT,
              messages,
              abortSignal,
              onAbort: () => {
                appendOutputStream("\n\nGeneration cancelled by user.");
              },
            });

            const consumeReasoning = (async () => {
              const appleReasoningOutput = await appleReasoning;
              for (const delta of appleReasoningOutput) {
                if (delta?.text) {
                  appendReasoning(delta.text);
                }
              }
            })();

            const consumeText = (async () => {
              const iterator = appleTextStream[Symbol.asyncIterator]();
              let result = await iterator.next();
              while (!result.done) {
                appendStreamChunk(result.value, appendOutputStream);
                result = await iterator.next();
              }
            })();

            const consumeTotalUsage = (async () => {
              const usage = await appleTotalUsage;
              console.log("apple usage", usage);
            })();

            const consumeFinalText = (async () => {
              const finalText = await appleText;
              setOutputText(finalText);
            })();

            await Promise.all([
              consumeReasoning,
              consumeText,
              consumeTotalUsage,
              consumeFinalText,
            ]);
          } catch (error) {
            console.log("Error during Apple model processing:", error);
          }
          break;
        }
        case "llama": {
          const runtime = buildLlamaRuntime(selectedModel.key, hasMedia);
          if (!runtime) {
            setOutputText(
              `Model "${selectedModel.label}" is not configured correctly.`,
            );
            break;
          }

          try {
            await ensureDownloaded(runtime.selectedModel.key);
          } catch (error) {
            console.log("Error while downloading model:", error);
            appendOutputStream(
              "An error occurred while downloading the model. Please try again.",
            );
            break;
          }

          await runLlamaGeneration({
            runtime,
            prompt,
            photos,
            abortSignal,
            setOutputText,
            appendReasoning,
            appendOutputStream,
            onCorruptedModel: async () => {
              await handleCorruptedModel(runtime.selectedModel.key);
            },
          });
          break;
        }
      }
    } finally {
      flushStreamingBuffers();
      abortRef.current = null;
      setActiveModelKey(undefined);
      setActiveModelLabel(undefined);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    reasoningLog,
    outputStreamText,
    outputText,
    activeModelKey,
    activeModelLabel,
    generatedModelKey,
    generateNote,
    cancelGeneration,
  };
}
