import { useModelCatalogModels } from "@/hooks/use-model-catalog";
import { SelectionModalOption } from "@/types/selection";
import { ComponentProps, useMemo } from "react";
import { IconSymbol } from "../ui/icon-symbol";
import BaseSelectModel from "./base";
type IconName = ComponentProps<typeof IconSymbol>["name"];

const ICON_BY_MODEL_KEY: Partial<Record<string, IconName>> = {
  apple: "apple.intelligence",
  "llama-default-vision": "text.below.photo",
  "llama-default-text": "text.alignleft",
  "ruv-claude-code-0.5b": "text.bubble",
  "llama-3.2-1b-instruct": "brain",
};

export default function SelectModel() {
  const { models } = useModelCatalogModels();
  const menuOptions = useMemo<SelectionModalOption[]>(
    () =>
      models.map((model) => ({
        icon: ICON_BY_MODEL_KEY[model.key] || "brain",
        label: model.label,
        value: model.key,
      })),
    [models],
  );

  return <BaseSelectModel menuOptions={menuOptions} />;
}
