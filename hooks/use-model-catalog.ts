import { useModelCatalogStore } from "@/store/model-catalog-store";
import { useCallback, useEffect } from "react";

export function useInitModelCatalog() {
  const refresh = useModelCatalogStore((state) => state.refresh);

  useEffect(() => {
    void refresh();
  }, [refresh]);
}

export function useModelCatalogModels() {
  const models = useModelCatalogStore((state) => state.models);
  const isRefreshing = useModelCatalogStore((state) => state.isRefreshing);
  const error = useModelCatalogStore((state) => state.error);

  return {
    models,
    isRefreshing,
    error,
  };
}

export function useModelCatalogActions() {
  const refresh = useModelCatalogStore((state) => state.refresh);
  const download = useModelCatalogStore((state) => state.download);
  const removeAllDownloaded = useModelCatalogStore(
    (state) => state.removeAllDownloaded,
  );
  const deleteModel = useModelCatalogStore((state) => state.delete);
  const addCustom = useModelCatalogStore((state) => state.addCustom);
  const removeCustom = useModelCatalogStore((state) => state.removeCustom);

  return {
    refresh,
    download,
    removeAllDownloaded,
    delete: deleteModel,
    addCustom,
    removeCustom,
  };
}

export function useModelCatalogGeneration() {
  const ensureDownloaded = useModelCatalogStore(
    (state) => state.ensureDownloaded,
  );
  const resolveForGeneration = useModelCatalogStore(
    (state) => state.resolveForGeneration,
  );
  const buildLlamaRuntime = useModelCatalogStore(
    (state) => state.buildLlamaRuntime,
  );
  const handleCorruptedModel = useModelCatalogStore(
    (state) => state.handleCorruptedModel,
  );

  return {
    ensureDownloaded,
    resolveForGeneration,
    buildLlamaRuntime,
    handleCorruptedModel,
  };
}

export function useModelDownloadProgress(modelKey?: string) {
  const selector = useCallback(
    (state: ReturnType<typeof useModelCatalogStore.getState>) => {
      if (!modelKey) {
        return undefined;
      }
      return state.models.find((model) => model.key === modelKey);
    },
    [modelKey],
  );

  const model = useModelCatalogStore(selector);

  return {
    isDownloading: model?.isDownloading ?? false,
    downloadProgress: model?.downloadProgress ?? 0,
    isDownloaded: model?.isDownloaded ?? false,
  };
}
