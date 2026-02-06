import {
  getDefaultLlamaVisionConfig,
  getLlamaBuiltinModelCatalog,
  pickDefaultLlamaCatalogItem,
} from "@/constants/model-catalog.shared";
import { ModelCapability, ModelCatalogItem } from "@/types/model-catalog";
import { apple } from "@react-native-ai/apple";

export { getDefaultLlamaVisionConfig };

function getAppleModel(): ModelCatalogItem {
  return {
    key: "apple",
    label: "Apple Intelligence",
    provider: "apple",
    source: "builtin",
    modelOption: "apple",
    requiresDownload: false,
    capabilities: ["text", "vision", "reasoning"],
    description: "Uses the on-device Apple model when available.",
  };
}

export function getBuiltinModelCatalog(): ModelCatalogItem[] {
  const models = getLlamaBuiltinModelCatalog();
  if (!apple.isAvailable()) {
    return models;
  }
  return [getAppleModel(), ...models];
}

export function getDefaultLlamaCatalogItem(
  type: ModelCapability = "vision",
): ModelCatalogItem {
  return pickDefaultLlamaCatalogItem(getBuiltinModelCatalog(), type);
}
