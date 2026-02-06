import { Asset } from "@/types/asset";
import { useState } from "react";
import { runLlamaGeneration, useAIModelState } from "./use-ai-model.shared";
import { useModelCatalogGeneration } from "./use-model-catalog";

export function useAIModel() {
  const {
    isGenerating,
    reasoningLog,
    outputText,
    outputStreamText,
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

  const generateNote = async (
    modelKey: string | undefined,
    prompt: string,
    photos?: Asset[],
  ) => {
    resetStreamingState();
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

      if (selectedModel.provider === "apple") {
        appendReasoning("Apple Intelligence is only available on iOS.");
        setOutputText(
          "Apple Intelligence is not available on this platform. Select a LLaMA model.",
        );
        return;
      }

      const runtime = buildLlamaRuntime(selectedModel.key, hasMedia);
      if (!runtime) {
        setOutputText(
          `Model "${selectedModel.label}" is not configured correctly.`,
        );
        return;
      }

      try {
        await ensureDownloaded(runtime.selectedModel.key);
      } catch (error) {
        console.log("Error while downloading model:", error);
        appendOutputStream(
          "An error occurred while downloading the model. Please try again.",
        );
        return;
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
    outputText,
    outputStreamText,
    activeModelKey,
    activeModelLabel,
    generateNote,
    cancelGeneration,
  };
}
