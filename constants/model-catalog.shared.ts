import { ModelCapability, ModelCatalogItem } from "@/types/model-catalog";
import * as Device from "expo-device";

export type LlamaVisionConfig = {
  modelId: string;
  projectorModelId: string;
  fileName: string;
  projectorFileName: string;
};

const LLAMA_RUNTIME_CONFIG = {
  // device: {
  //   modelId: "noctrex/LightOnOCR-2-1B-GGUF/LightOnOCR-2-1B-BF16.gguf",
  //   projectorModelId: "noctrex/LightOnOCR-2-1B-GGUF/mmproj-BF16.gguf",
  //   fileName: "LightOnOCR-2-1B-BF16.gguf",
  //   projectorFileName: "mmproj-BF16.gguf",
  // },
  device: {
    modelId: "lmstudio-community/gemma-3-4b-it-GGUF/gemma-3-4b-it-Q3_K_L.gguf",
    projectorModelId:
      "lmstudio-community/gemma-3-4b-it-GGUF/mmproj-model-f16.gguf",
    fileName: "gemma-3-4b-it-Q3_K_L.gguf",
    projectorFileName: "mmproj-model-f16.gguf",
  },
  simulator: {
    modelId: "lmstudio-community/gemma-3-4b-it-GGUF/gemma-3-4b-it-Q3_K_L.gguf",
    projectorModelId:
      "lmstudio-community/gemma-3-4b-it-GGUF/mmproj-model-f16.gguf",
    fileName: "gemma-3-4b-it-Q3_K_L.gguf",
    projectorFileName: "mmproj-model-f16.gguf",
  },
} satisfies Record<"device" | "simulator", LlamaVisionConfig>;

export function getDefaultLlamaVisionConfig(): LlamaVisionConfig {
  return Device.isDevice
    ? LLAMA_RUNTIME_CONFIG.device
    : LLAMA_RUNTIME_CONFIG.simulator;
}

export function getLlamaBuiltinModelCatalog(): ModelCatalogItem[] {
  const llamaVision = getDefaultLlamaVisionConfig();

  return [
    {
      key: "llama-default-text",
      label: "Qwen 2.5 3B Instruct",
      provider: "llama",
      source: "builtin",
      modelId: "Qwen/Qwen2.5-3B-Instruct-GGUF/qwen2.5-3b-instruct-q3_k_m.gguf",
      fileName: "qwen2.5-3b-instruct-q3_k_m.gguf",
      requiresDownload: true,
      capabilities: ["text"],
      description: "Text-only GGUF model for on-device generation.",
    },
    {
      key: "llama-default-vision",
      label: "LLaMA Vision",
      provider: "llama",
      source: "builtin",
      modelOption: "llama",
      modelId: llamaVision.modelId,
      projectorModelId: llamaVision.projectorModelId,
      fileName: llamaVision.fileName,
      projectorFileName: llamaVision.projectorFileName,
      requiresDownload: true,
      capabilities: ["text", "vision", "multimodal"],
      description: "Default on-device multimodal GGUF model.",
    },
    {
      key: "ruv-claude-code-0.5b",
      label: "Ruv Claude Code 0.5B",
      provider: "llama",
      source: "builtin",
      modelId: "ruv/ruvltra-claude-code/ruvltra-claude-code-0.5b-q4_k_m.gguf",
      fileName: "ruvltra-claude-code-0.5b-q4_k_m.gguf",
      requiresDownload: true,
      capabilities: ["text"],
      description: "Text-only GGUF model for on-device generation.",
    },
    {
      key: "llama-3.2-1b-instruct",
      label: "LLaMA 3.2 1B Instruct",
      provider: "llama",
      source: "builtin",
      modelId:
        "unsloth/Llama-3.2-1B-Instruct-GGUF/Llama-3.2-1B-Instruct-BF16.gguf",
      fileName: "Llama-3.2-1B-Instruct-BF16.gguf",
      requiresDownload: true,
      capabilities: ["text"],
      description: "Text-only GGUF model for on-device generation.",
    },
  ];
}

export function pickDefaultLlamaCatalogItem(
  catalog: ModelCatalogItem[],
  type: ModelCapability,
): ModelCatalogItem {
  const key = type === "vision" ? "llama-default-vision" : "llama-default-text";
  const llamaModel = catalog.find((model) => model.key === key);

  if (!llamaModel) {
    throw new Error("Missing default LLaMA model configuration.");
  }

  return llamaModel;
}
