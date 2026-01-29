import { useCallback, useRef, useState } from "react";

export const SYSTEM_PROMPT =
  "You are an AI assistant that helps users write notes based on images they provide. Analyze the images and generate a concise and informative note. Always generate text in a markdown format.";

export type AIModelSharedState = {
  isLoading: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  reasoningLog: string[];
  outputText: string;
  abortRef: React.RefObject<AbortController | null>;
};

export type AIModelSharedHelpers = {
  setIsLoading: (value: boolean) => void;
  setIsDownloading: (value: boolean) => void;
  setDownloadProgress: (value: number) => void;
  resetStreamingState: () => void;
  appendReasoning: (text: string) => void;
  appendOutput: (text: string) => void;
};

export function useAIModelState(): AIModelSharedState & AIModelSharedHelpers {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [reasoningLog, setReasoningLog] = useState<string[]>([]);
  const [outputText, setOutputText] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const resetStreamingState = useCallback(() => {
    setOutputText("");
    setReasoningLog([]);
  }, []);

  const appendReasoning = useCallback((text: string) => {
    setReasoningLog((prev) => [...prev, text]);
  }, []);

  const appendOutput = useCallback((text: string) => {
    setOutputText((prev) => prev + text);
  }, []);

  return {
    isLoading,
    isDownloading,
    downloadProgress,
    reasoningLog,
    outputText,
    setIsLoading,
    setIsDownloading,
    setDownloadProgress,
    resetStreamingState,
    appendReasoning,
    appendOutput,
    abortRef,
  };
}
