import { getDownloadedModels, removeModel } from "@react-native-ai/llama";
import { useCallback, useRef, useState } from "react";

export const SYSTEM_PROMPT =
  "You are an AI assistant that helps users write notes. Your main objective is to summarize images into clear, conciese, relevant and engaging notes. Use the users language of preference to write the note and to comunicate with the user. Write in a engaging and informative style in markdown format. Always write the note in markdown format.";

export type AIModelSharedState = {
  isGenerating: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  reasoningLog: string[];
  outputStreamText: string;
  outputText: string;
  abortRef: React.RefObject<AbortController | null>;
};

export type AIModelSharedHelpers = {
  setIsGenerating: (value: boolean) => void;
  setIsDownloading: (value: boolean) => void;
  setDownloadProgress: (value: number) => void;
  setOutputText: (text: string) => void;
  resetStreamingState: () => void;
  appendReasoning: (text: string) => void;
  appendOutputStream: (text: string) => void;
  cancelGeneration: () => void;
  removeAllModels: () => Promise<void>;
};

export function useAIModelState(): AIModelSharedState & AIModelSharedHelpers {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [reasoningLog, setReasoningLog] = useState<string[]>([]);
  const [outputStreamText, setOutputStreamText] = useState<string>("");
  const [outputText, setOutputText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const resetStreamingState = useCallback(() => {
    setOutputStreamText("");
    setReasoningLog([]);
  }, []);

  const appendReasoning = useCallback((text: string) => {
    setReasoningLog((prev) => [...prev, text]);
  }, []);

  const appendOutputStream = useCallback((text: string) => {
    setOutputStreamText((prev) => prev + text);
  }, []);

  const cancelGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    appendOutputStream(`\n\nGeneration cancelled by user.`);
  };

  const removeAllModels = async () => {
    const models = await getDownloadedModels();
    for (const model of models) {
      console.log("Removing model:", model.path);
      await removeModel(model.path);
    }
  };

  return {
    isGenerating,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputStreamText,
    outputText,
    abortRef,
    setIsGenerating,
    setIsDownloading,
    setOutputText,
    setDownloadProgress,
    resetStreamingState,
    appendReasoning,
    appendOutputStream,
    cancelGeneration,
    removeAllModels,
  };
}
