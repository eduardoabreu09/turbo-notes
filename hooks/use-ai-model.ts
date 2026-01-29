import { ModelOptions } from "@/types/model";
import { useCallback } from "react";

import { useAIModelState } from "./use-ai-model.shared";

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

  const generateNote = useCallback(
    async (_model: ModelOptions, prompt: string, _images?: string[]) => {
      resetStreamingState();
      setIsLoading(true);

      appendReasoning("Provider não definido para esta plataforma.");
      appendOutput(
        "Implemente um provider ou backend para web/desktop.\n\nPrompt:\n" +
          prompt,
      );

      setIsLoading(false);
    },
    [appendOutput, appendReasoning, resetStreamingState, setIsLoading],
  );

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
