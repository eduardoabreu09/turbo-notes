export type ModelOptions = "apple" | "llama";

export type ModelCapability = "text" | "vision" | "multimodal" | "reasoning";

export type ModelProvider = "apple" | "llama";
export type ModelSource = "builtin" | "custom";

export type ModelCatalogItem = {
  key: string;
  label: string;
  provider: ModelProvider;
  source: ModelSource;
  modelId?: string;
  fileName?: string;
  projectorFileName?: string;
  projectorModelId?: string;
  modelOption?: ModelOptions;
  requiresDownload: boolean;
  capabilities: ModelCapability[];
  description?: string;
};

export type ManagedModelCatalogItem = ModelCatalogItem & {
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  sizeBytes?: number;
  missingModelIds: string[];
};

export type AddCustomModelInput = {
  modelId: string;
  projectorModelId?: string;
  label?: string;
  capabilities?: ModelCapability[];
};
