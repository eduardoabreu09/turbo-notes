import { ModelOptions } from "@/app/types/model";
import { SFSymbol } from "expo-symbols";
import { useState } from "react";
import ContextMenu, { ContextMenuItem } from "./ui/context-menu";

export default function SelectModel() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<SFSymbol | null>(null);

  const menuOptions: ContextMenuItem<ModelOptions>[] = [
    {
      icon: "apple.intelligence",
      label: "Apple Intelligence",
      value: "apple",
    },
    {
      icon: "brain",
      label: "LLaMA Model",
      value: "llama",
    },
  ];

  return (
    <ContextMenu<ModelOptions>
      title={selectedModel ? selectedModel : "Select Model"}
      items={menuOptions}
      icon={selectedIcon ?? "brain"}
      onSelect={(item) => {
        setSelectedModel(item.label);
        setSelectedIcon(item.icon ?? null);
      }}
    />
  );
}
