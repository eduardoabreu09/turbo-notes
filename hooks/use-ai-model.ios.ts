import { ModelOptions } from "@/types/model";

import { apple } from "@react-native-ai/apple";
import {
  downloadModel,
  getModelPath,
  isModelDownloaded,
  llama,
  removeModel,
} from "@react-native-ai/llama";
import { FilePart, streamText } from "ai";

import { Asset } from "@/types/asset";
import * as Device from "expo-device";
import { SYSTEM_PROMPT, useAIModelState } from "./use-ai-model.shared";

const MODEL_REPO = "noctrex/LightOnOCR-2-1B-GGUF";
const MODEL_ID = `${MODEL_REPO}/LightOnOCR-2-1B-BF16.gguf`;
const PROJECT_MODEL_ID = `${MODEL_REPO}/mmproj-BF16.gguf`;

export function useAIModel() {
  const {
    isGenerating,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputStreamText,
    outputText,
    abortRef,
    setIsGenerating,
    resetStreamingState,
    appendReasoning,
    appendOutputStream,
    setOutputText,
    setDownloadProgress,
    setIsDownloading,
    cancelGeneration,
  } = useAIModelState();

  const mapAssetToMessage = (photos: Asset[]): FilePart[] => {
    return photos.map((photo) => ({
      type: "file",
      mediaType: photo.mimeType || "image/jpeg",
      data: photo.uri, // Assuming uri is a local file path
    }));
  };

  const generateNote = async (
    model: ModelOptions,
    prompt: string,
    photos?: Asset[],
  ) => {
    resetStreamingState();
    setIsGenerating(true);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const appendChunk = (delta: unknown) => {
      if (typeof delta === "string") {
        appendOutputStream(delta);
      } else if (typeof (delta as { text?: string })?.text === "string") {
        appendOutputStream((delta as { text: string }).text);
      }
    };

    switch (model) {
      case "apple":
        {
          const appleAbortSignal = abortRef.current
            ? abortRef.current.signal
            : undefined;
          const fileMessage = mapAssetToMessage(photos || []);

          try {
            const {
              textStream: appleTextStream,
              reasoning: appleReasoning,
              totalUsage: appleTotalUsage,
              text: appleText,
            } = streamText({
              model: apple(),
              system: SYSTEM_PROMPT,
              messages: [
                { role: "user", content: prompt },
                {
                  role: "user",
                  content: fileMessage,
                },
              ],
              abortSignal: appleAbortSignal,
              onAbort: () => {
                appendOutputStream("\n\nGeneration cancelled by user.");
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
              const iterator = appleTextStream[Symbol.asyncIterator]();
              let result = await iterator.next();
              while (!result.done) {
                const delta = result.value;
                console.log("apple output:", delta);
                appendChunk(delta);
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
        }
        break;

      case "llama":
        // Create model instance (Model ID format: "owner/repo/filename.gguf")
        const abortSignal = abortRef.current
          ? abortRef.current.signal
          : undefined;

        const isDownloaded = await isModelDownloaded(MODEL_ID);
        console.log("LLaMA model isDownloaded:", isDownloaded);

        const isDownloadedProjectModel =
          await isModelDownloaded(PROJECT_MODEL_ID);

        console.log(
          "LLaMA project model isDownloaded:",
          isDownloadedProjectModel,
        );

        const needDownload = !isDownloaded || !isDownloadedProjectModel;
        const fileMessage = mapAssetToMessage(photos || []);
        const projectorOptions = Device.isDevice
          ? {
              projectorUseGpu: true,
              contextParams: {
                n_ctx: 2048,
                n_gpu_layers: 99, // Recommended for multimodal models
                // Important: Disable context shifting for multimodal
                ctx_shift: false,
              },
            }
          : { projectorUseGpu: false };
        console.log("fileMessage:", fileMessage);
        try {
          if (needDownload) {
            setIsDownloading(true);
            // Download from HuggingFace (with progress)
            await downloadModel(MODEL_ID, (progress) => {
              console.log(`Downloading: ${progress.percentage}%`);
            });

            await downloadModel(PROJECT_MODEL_ID, (progress) => {
              console.log(`Downloading project model: ${progress.percentage}%`);
            });

            setIsDownloading(false);
          }

          const modelPath = getModelPath(MODEL_ID);
          const projectorPath = getModelPath(PROJECT_MODEL_ID);
          const modelLlama = llama.languageModel(modelPath, {
            projectorPath,
            ...projectorOptions,
          });

          // Initialize model (loads into memory)
          const context = await modelLlama.prepare();
          console.log("LLaMA model context:", context.systemInfo);

          // Generate text
          const { textStream, reasoning, providerMetadata, totalUsage, text } =
            streamText({
              model: modelLlama,
              system: SYSTEM_PROMPT,
              messages: [
                { role: "user", content: prompt },
                {
                  role: "user",
                  content: fileMessage,
                },
              ],
              abortSignal,
              onAbort: () => {
                appendOutputStream("\n\nGeneration cancelled by user.");
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
            const iterator = textStream[Symbol.asyncIterator]();
            let result = await iterator.next();
            while (!result.done) {
              const delta = result.value;
              console.log("llama output:", delta);
              appendChunk(delta);
              result = await iterator.next();
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

          const consumeFinalText = (async () => {
            const finalText = await text;
            setOutputText(finalText);
          })();

          await Promise.all([
            consumeReasoning,
            consumeText,
            consumeMetaData,
            consumeTotalUsage,
            consumeFinalText,
          ]);

          // Cleanup when done
          await modelLlama.unload();
        } catch (err) {
          // INFO: this happens when the model file is corrupted
          if (err === "Failed to load model") {
            removeModel(MODEL_ID);
            removeModel(PROJECT_MODEL_ID);
            setOutputText(
              "Failed to load LLaMA model. The model files might be corrupted and have been removed. Please try generating again to re-download the model.",
            );
          }
          console.log("Error during LLaMA model processing:", err);
          appendOutputStream(
            "An error occurred while processing the LLaMA model. Please try again.",
          );
          // TODO: Cleanup when done
        }

        break;
      default:
        break;
    }

    abortRef.current = null;
    setIsGenerating(false);
  };

  return {
    isGenerating,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputStreamText,
    outputText,
    generateNote,
    cancelGeneration,
  };
}
