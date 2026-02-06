import { LlamaRuntime } from "@/store/model-catalog-store";
import { Asset } from "@/types/asset";
import { llama } from "@react-native-ai/llama";
import { FilePart, streamText } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";

export const SYSTEM_PROMPT =
  "You are an AI assistant that helps users write notes. Your main objective is to summarize images into clear, conciese, relevant and engaging notes. Use the users language of preference to write the note and to comunicate with the user. Write in a engaging and informative style in markdown format. Always write the note in markdown format.";

export type AIModelSharedState = {
  isGenerating: boolean;
  reasoningLog: string[];
  outputStreamText: string;
  outputText: string;
  abortRef: React.RefObject<AbortController | null>;
};

export type AIModelSharedHelpers = {
  setIsGenerating: (value: boolean) => void;
  setOutputText: (text: string) => void;
  resetStreamingState: () => void;
  flushStreamingBuffers: () => void;
  appendReasoning: (text: string) => void;
  appendOutputStream: (text: string) => void;
  cancelGeneration: () => void;
};

const STREAM_FLUSH_INTERVAL_MS = 100;

type RunLlamaGenerationParams = {
  runtime: LlamaRuntime;
  prompt: string;
  photos?: Asset[];
  abortSignal?: AbortSignal;
  setOutputText: (text: string) => void;
  appendReasoning: (text: string) => void;
  appendOutputStream: (text: string) => void;
  onCorruptedModel?: () => Promise<void> | void;
};

export function mapAssetToMessage(photos: Asset[]): FilePart[] {
  return photos.map((photo) => ({
    type: "file",
    mediaType: photo.mimeType || "image/jpeg",
    data: photo.uri,
  }));
}

export function appendStreamChunk(
  delta: unknown,
  appendOutputStream: (text: string) => void,
) {
  if (typeof delta === "string") {
    appendOutputStream(delta);
  } else if (typeof (delta as { text?: string })?.text === "string") {
    appendOutputStream((delta as { text: string }).text);
  }
}

export async function runLlamaGeneration({
  runtime,
  prompt,
  photos,
  abortSignal,
  setOutputText,
  appendReasoning,
  appendOutputStream,
  onCorruptedModel,
}: RunLlamaGenerationParams) {
  const fileMessage = runtime.supportsMedia
    ? mapAssetToMessage(photos || [])
    : [];

  if (!runtime.supportsMedia && photos && photos.length > 0) {
    appendReasoning("Selected model is text-only. Images were ignored.");
  }

  const messages = [
    { role: "user" as const, content: prompt },
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...(fileMessage.length > 0
      ? [{ role: "user" as const, content: fileMessage }]
      : []),
  ];

  let modelLlama: ReturnType<typeof llama.languageModel> | null = null;

  try {
    modelLlama = llama.languageModel(
      runtime.modelPath,
      runtime.llamaOptions as Parameters<typeof llama.languageModel>[1],
    );
    await modelLlama.prepare();

    const { textStream, reasoning, providerMetadata, totalUsage, text } =
      streamText({
        model: modelLlama,
        messages,
        abortSignal,
        onAbort: () => {
          appendOutputStream("\n\nGeneration cancelled by user.");
        },
      });

    const consumeReasoning = (async () => {
      const reasoningOutput = await reasoning;
      for (const delta of reasoningOutput) {
        if (delta?.text) {
          appendReasoning(delta.text);
        }
      }
    })();

    const consumeText = (async () => {
      const iterator = textStream[Symbol.asyncIterator]();
      let result = await iterator.next();
      while (!result.done) {
        appendStreamChunk(result.value, appendOutputStream);
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
  } catch (err) {
    if (err === "Failed to load model") {
      if (onCorruptedModel) {
        await onCorruptedModel();
      }
      setOutputText(
        `Failed to load "${runtime.selectedModel.label}". Model files might be corrupted and were removed. Try generating again to re-download.`,
      );
    }

    console.log("Error during LLaMA model processing:", err);
    appendOutputStream(
      "An error occurred while processing the model. Please try again.",
    );
  } finally {
    if (modelLlama) {
      try {
        await modelLlama.unload();
      } catch (error) {
        console.log("Error while unloading model:", error);
      }
    }
  }
}

export function useAIModelState(): AIModelSharedState & AIModelSharedHelpers {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reasoningLog, setReasoningLog] = useState<string[]>([]);
  const [outputStreamText, setOutputStreamText] = useState<string>("");
  const [outputText, setOutputText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const reasoningBufferRef = useRef<string[]>([]);
  const outputStreamBufferRef = useRef("");
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushStreamingBuffers = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    const outputBuffer = outputStreamBufferRef.current;
    if (outputBuffer.length > 0) {
      outputStreamBufferRef.current = "";
      setOutputStreamText((prev) => prev + outputBuffer);
    }

    if (reasoningBufferRef.current.length > 0) {
      const bufferedReasoning = reasoningBufferRef.current;
      reasoningBufferRef.current = [];
      setReasoningLog((prev) => [...prev, ...bufferedReasoning]);
    }
  }, []);

  const scheduleStreamingFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      return;
    }

    flushTimeoutRef.current = setTimeout(() => {
      flushTimeoutRef.current = null;
      flushStreamingBuffers();
    }, STREAM_FLUSH_INTERVAL_MS);
  }, [flushStreamingBuffers]);

  const resetStreamingState = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    outputStreamBufferRef.current = "";
    reasoningBufferRef.current = [];
    setOutputStreamText("");
    setReasoningLog([]);
  }, []);

  const appendReasoning = useCallback(
    (text: string) => {
      reasoningBufferRef.current.push(text);
      scheduleStreamingFlush();
    },
    [scheduleStreamingFlush],
  );

  const appendOutputStream = useCallback(
    (text: string) => {
      outputStreamBufferRef.current += text;
      scheduleStreamingFlush();
    },
    [scheduleStreamingFlush],
  );

  const cancelGeneration = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    outputStreamBufferRef.current += "\n\nGeneration cancelled by user.";
    flushStreamingBuffers();
  }, [flushStreamingBuffers]);

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
    };
  }, []);

  return {
    isGenerating,
    reasoningLog,
    outputStreamText,
    outputText,
    abortRef,
    setIsGenerating,
    setOutputText,
    resetStreamingState,
    flushStreamingBuffers,
    appendReasoning,
    appendOutputStream,
    cancelGeneration,
  };
}
