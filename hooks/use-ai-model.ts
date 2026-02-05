import { ModelOptions } from "@/types/model";

import { Asset } from "@/types/asset";
import { useAIModelState } from "./use-ai-model.shared";

export function useAIModel() {
  const {
    isGenerating,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputText,
    outputStreamText,
    setIsGenerating,
    resetStreamingState,
    appendReasoning,
    setOutputText,
    cancelGeneration,
    removeAllModels,
  } = useAIModelState();

  const generateNote = async (
    _model: ModelOptions,
    prompt: string,
    _photos?: Asset[],
  ) => {
    resetStreamingState();
    setIsGenerating(true);

    appendReasoning("Provider não definido para esta plataforma.");
    setOutputText(
      "Implemente um provider ou backend para web/desktop.\n\nPrompt:\n" +
        prompt,
    );

    setIsGenerating(false);
  };

  return {
    isGenerating,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputText,
    outputStreamText,
    generateNote,
    cancelGeneration,
    removeAllModels,
  };
}
