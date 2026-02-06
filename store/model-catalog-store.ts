import { getBuiltinModelCatalog } from "@/constants/model-catalog";
import {
  AddCustomModelInput,
  ManagedModelCatalogItem,
  ModelCatalogItem,
} from "@/types/model-catalog";
import validateModelId, {
  ModelIdValidationResult,
} from "@/utils/validate-model-id";
import {
  downloadModel,
  getDownloadedModels,
  getModelPath,
  removeModel,
} from "@react-native-ai/llama";
import * as Device from "expo-device";
import { create } from "zustand";

type DownloadedModelMap = Record<
  string,
  {
    sizeBytes?: number;
  }
>;

export type LlamaRuntime = {
  selectedModel: ManagedModelCatalogItem;
  modelId: string;
  projectorModelId?: string;
  supportsMedia: boolean;
  modelPath: string;
  llamaOptions: Record<string, unknown>;
};

const inFlightDownloads = new Map<string, Promise<void>>();

type ModelCatalogState = {
  models: ManagedModelCatalogItem[];
  customModels: ModelCatalogItem[];
  downloadedByModelId: DownloadedModelMap;
  downloadingByKey: Record<string, number>;
  isRefreshing: boolean;
  error?: string;
  refresh: () => Promise<void>;
  download: (modelKey: string) => Promise<void>;
  ensureDownloaded: (modelKey: string) => Promise<void>;
  resolveForGeneration: (
    modelKey?: string,
    hasMedia?: boolean,
  ) => ManagedModelCatalogItem | undefined;
  buildLlamaRuntime: (
    modelKey?: string,
    hasMedia?: boolean,
  ) => LlamaRuntime | undefined;
  handleCorruptedModel: (modelKey: string) => Promise<void>;
  removeAllDownloaded: () => Promise<void>;
  delete: (modelKey: string) => Promise<void>;
  addCustom: (input: AddCustomModelInput) => ModelIdValidationResult;
  removeCustom: (modelKey: string) => Promise<void>;
};

function buildCatalog(customModels: ModelCatalogItem[]): ModelCatalogItem[] {
  return [...getBuiltinModelCatalog(), ...customModels];
}

function getRequiredModelIds(model: ModelCatalogItem): string[] {
  const ids: string[] = [];
  if (model.fileName) {
    ids.push(model.fileName);
  }
  if (model.projectorFileName) {
    ids.push(model.projectorFileName);
  }
  return ids;
}

function buildManagedModels(
  catalog: ModelCatalogItem[],
  downloadedByModelId: DownloadedModelMap,
  downloadingByKey: Record<string, number>,
): ManagedModelCatalogItem[] {
  return catalog.map((model) => {
    const requiredModelIds = getRequiredModelIds(model);
    const missingModelIds = requiredModelIds.filter(
      (modelId) => !downloadedByModelId[modelId],
    );
    const sizeBytes = requiredModelIds.reduce((total, modelId) => {
      return total + (downloadedByModelId[modelId]?.sizeBytes ?? 0);
    }, 0);
    const isDownloaded =
      !model.requiresDownload ||
      (requiredModelIds.length > 0 && missingModelIds.length === 0);

    const progress = downloadingByKey[model.key];
    const isDownloading = typeof progress === "number";

    return {
      ...model,
      isDownloaded,
      isDownloading,
      downloadProgress:
        typeof progress === "number" ? progress : isDownloaded ? 100 : 0,
      sizeBytes: sizeBytes > 0 ? sizeBytes : undefined,
      missingModelIds,
    };
  });
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function buildCustomKey(modelId: string): string {
  return `custom:${modelId.trim().toLowerCase()}`;
}

function deriveLabel(modelId: string): string {
  const filename = modelId.split("/").at(-1) ?? modelId;
  return filename.replace(/\.gguf$/i, "");
}

async function fetchDownloadedByModelId(): Promise<DownloadedModelMap> {
  const downloadedModels = await getDownloadedModels();
  return downloadedModels.reduce<DownloadedModelMap>((acc, model) => {
    acc[model.model_id] = {
      sizeBytes: model.sizeBytes,
    };
    return acc;
  }, {});
}

function findModelByKey(catalog: ModelCatalogItem[], modelKey: string) {
  return catalog.find((model) => model.key === modelKey);
}

function getFallbackModel(
  models: ManagedModelCatalogItem[],
  hasMedia: boolean,
): ManagedModelCatalogItem | undefined {
  const preferredKey = hasMedia ? "llama-default-vision" : "llama-default-text";
  const preferred = models.find((model) => model.key === preferredKey);
  if (preferred) {
    return preferred;
  }

  const firstLlama = models.find((model) => model.provider === "llama");
  if (firstLlama) {
    return firstLlama;
  }

  return models[0];
}

function resolveModelFromManagedState(
  models: ManagedModelCatalogItem[],
  modelKey?: string,
  hasMedia?: boolean,
): ManagedModelCatalogItem | undefined {
  const selected =
    modelKey && modelKey.length > 0
      ? models.find((model) => model.key === modelKey)
      : undefined;
  if (selected) {
    return selected;
  }
  return getFallbackModel(models, Boolean(hasMedia));
}

function getProjectorOptions(hasProjectorModel: boolean) {
  if (!hasProjectorModel) {
    return {};
  }

  return Device.isDevice
    ? {
        projectorUseGpu: true,
        contextParams: {
          n_ctx: 2048,
          n_gpu_layers: 99,
          ctx_shift: false,
        },
      }
    : { projectorUseGpu: false };
}

const initialModels = buildManagedModels(buildCatalog([]), {}, {});

export const useModelCatalogStore = create<ModelCatalogState>((set, get) => ({
  models: initialModels,
  customModels: [],
  downloadedByModelId: {},
  downloadingByKey: {},
  isRefreshing: false,
  error: undefined,
  resolveForGeneration: (modelKey, hasMedia = false) =>
    resolveModelFromManagedState(get().models, modelKey, hasMedia),
  buildLlamaRuntime: (modelKey, hasMedia = false) => {
    const selectedModel = get().resolveForGeneration(modelKey, hasMedia);
    if (
      !selectedModel ||
      selectedModel.provider !== "llama" ||
      !selectedModel.modelId
    ) {
      return undefined;
    }

    const hasProjectorModel = Boolean(selectedModel.projectorModelId);
    const projectorPath =
      hasProjectorModel && selectedModel.projectorModelId
        ? getModelPath(selectedModel.projectorModelId)
        : undefined;

    const projectorOptions = getProjectorOptions(hasProjectorModel);
    const llamaOptions = {
      ...(projectorPath ? { projectorPath } : {}),
      ...projectorOptions,
    };

    return {
      selectedModel,
      modelId: selectedModel.modelId,
      projectorModelId: selectedModel.projectorModelId,
      supportsMedia: hasProjectorModel,
      modelPath: getModelPath(selectedModel.modelId),
      llamaOptions,
    };
  },
  refresh: async () => {
    set({ isRefreshing: true, error: undefined });

    try {
      const downloadedByModelId = await fetchDownloadedByModelId();

      set((state) => {
        const catalog = buildCatalog(state.customModels);
        return {
          isRefreshing: false,
          downloadedByModelId,
          models: buildManagedModels(
            catalog,
            downloadedByModelId,
            state.downloadingByKey,
          ),
        };
      });
    } catch (error) {
      const message = toErrorMessage(
        error,
        "Failed to refresh downloaded models.",
      );
      set((state) => {
        const catalog = buildCatalog(state.customModels);
        return {
          isRefreshing: false,
          error: message,
          downloadedByModelId: {},
          models: buildManagedModels(catalog, {}, state.downloadingByKey),
        };
      });
    }
  },
  ensureDownloaded: async (modelKey) => {
    const currentTask = inFlightDownloads.get(modelKey);
    if (currentTask) {
      await currentTask;
      return;
    }

    const task = (async () => {
      const state = get();
      const model = state.models.find((item) => item.key === modelKey);

      if (
        !model ||
        !model.requiresDownload ||
        !model.modelId ||
        !model.fileName ||
        model.isDownloaded
      ) {
        return;
      }

      const needsModel = model.missingModelIds.includes(model.fileName);
      const needsProjector =
        model.projectorFileName &&
        model.missingModelIds.includes(model.projectorFileName);

      if (!needsModel && !needsProjector) {
        return;
      }

      const setProgress = (progress: number) => {
        set((current) => {
          const downloadingByKey = {
            ...current.downloadingByKey,
            [modelKey]: progress,
          };
          return {
            downloadingByKey,
            models: buildManagedModels(
              buildCatalog(current.customModels),
              current.downloadedByModelId,
              downloadingByKey,
            ),
          };
        });
      };

      set((current) => {
        const downloadingByKey = {
          ...current.downloadingByKey,
          [modelKey]: 0,
        };
        return {
          error: undefined,
          downloadingByKey,
          models: buildManagedModels(
            buildCatalog(current.customModels),
            current.downloadedByModelId,
            downloadingByKey,
          ),
        };
      });

      try {
        if (needsModel && needsProjector && model.projectorModelId) {
          await downloadModel(model.modelId, (progress) => {
            setProgress(Math.round(progress.percentage / 2));
          });
          await downloadModel(model.projectorModelId, (progress) => {
            setProgress(50 + Math.round(progress.percentage / 2));
          });
        } else if (needsModel) {
          await downloadModel(model.modelId, (progress) => {
            setProgress(Math.round(progress.percentage));
          });
        } else if (needsProjector && model.projectorModelId) {
          await downloadModel(model.projectorModelId, (progress) => {
            setProgress(Math.round(progress.percentage));
          });
        }
      } catch (error) {
        const message = toErrorMessage(error, "Failed to download model.");
        set({ error: message });
        throw error;
      } finally {
        set((current) => {
          const downloadingByKey = { ...current.downloadingByKey };
          delete downloadingByKey[modelKey];
          return {
            downloadingByKey,
            models: buildManagedModels(
              buildCatalog(current.customModels),
              current.downloadedByModelId,
              downloadingByKey,
            ),
          };
        });
        await get().refresh();
      }
    })();

    inFlightDownloads.set(modelKey, task);

    try {
      await task;
    } finally {
      inFlightDownloads.delete(modelKey);
    }
  },
  download: async (modelKey) => {
    await get().ensureDownloaded(modelKey);
  },
  handleCorruptedModel: async (modelKey) => {
    const model = get().models.find((item) => item.key === modelKey);
    if (model?.key) {
      await get().delete(modelKey);
      await get().ensureDownloaded(model?.key);
    }
  },
  removeAllDownloaded: async () => {
    const models = get().models.filter((model) => model.requiresDownload);
    for (const model of models) {
      await get().delete(model.key);
    }
  },
  delete: async (modelKey) => {
    const state = get();
    const catalog = buildCatalog(state.customModels);
    const model = findModelByKey(catalog, modelKey);

    if (!model || !model.requiresDownload) {
      return;
    }

    try {
      if (model.modelId) {
        await removeModel(model.modelId);
      }
      if (model.projectorModelId) {
        await removeModel(model.projectorModelId);
      }
      set({ error: undefined });
    } catch (error) {
      console.log(error);
      const message = toErrorMessage(error, "Failed to delete model.");
      set({ error: message });
    } finally {
      await get().refresh();
    }
  },
  addCustom: (input) => {
    const modelId = input.modelId.trim();
    const modelValidation = validateModelId(modelId);
    if (!modelValidation.valid) {
      return modelValidation;
    }

    const projectorModelId = input.projectorModelId?.trim();
    if (projectorModelId) {
      const projectorValidation = validateModelId(projectorModelId);
      if (!projectorValidation.valid) {
        return {
          valid: false,
          reason: `Projector model ID is invalid: ${projectorValidation.reason}`,
        };
      }
    }

    const key = buildCustomKey(modelId);
    let result: ModelIdValidationResult = { valid: true };

    set((state) => {
      const duplicate = state.customModels.some((model) => model.key === key);
      if (duplicate) {
        result = {
          valid: false,
          reason: "This model is already in your catalog.",
        };
        return state;
      }

      const customModel: ModelCatalogItem = {
        key,
        label: input.label?.trim() || deriveLabel(modelId),
        provider: "llama",
        source: "custom",
        modelId,
        projectorModelId,
        requiresDownload: true,
        capabilities:
          input.capabilities && input.capabilities.length > 0
            ? input.capabilities
            : projectorModelId
              ? ["text", "vision", "multimodal"]
              : ["text"],
      };

      const customModels = [...state.customModels, customModel];
      return {
        error: undefined,
        customModels,
        models: buildManagedModels(
          buildCatalog(customModels),
          state.downloadedByModelId,
          state.downloadingByKey,
        ),
      };
    });

    return result;
  },
  removeCustom: async (modelKey) => {
    const customModel = get().customModels.find(
      (model) => model.key === modelKey,
    );
    if (!customModel) {
      return;
    }

    try {
      if (customModel.modelId) {
        await removeModel(customModel.modelId);
      }
      if (customModel.projectorModelId) {
        await removeModel(customModel.projectorModelId);
      }
      set({ error: undefined });
    } catch (error) {
      const message = toErrorMessage(error, "Failed to remove custom model.");
      set({ error: message });
    } finally {
      set((state) => {
        const customModels = state.customModels.filter(
          (model) => model.key !== modelKey,
        );
        return {
          customModels,
          models: buildManagedModels(
            buildCatalog(customModels),
            state.downloadedByModelId,
            state.downloadingByKey,
          ),
        };
      });
      await get().refresh();
    }
  },
}));
