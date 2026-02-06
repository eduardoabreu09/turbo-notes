import {
  getDefaultLlamaVisionConfig,
  getLlamaBuiltinModelCatalog,
  pickDefaultLlamaCatalogItem,
} from "@/constants/model-catalog.shared";
import { ModelCapability, ModelCatalogItem } from "@/types/model-catalog";

export { getDefaultLlamaVisionConfig };

export function getBuiltinModelCatalog(): ModelCatalogItem[] {
  return getLlamaBuiltinModelCatalog();
}

export function getDefaultLlamaCatalogItem(
  type: ModelCapability = "vision",
): ModelCatalogItem {
  return pickDefaultLlamaCatalogItem(getBuiltinModelCatalog(), type);
}
