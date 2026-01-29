import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SFSymbol } from "expo-symbols";
import { useState } from "react";
import { ThemedText } from "./Themed";
import * as ContextMenu from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenu";
import { IconSymbol } from "./ui/icon-symbol";

export default function SelectModel() {
  const [selectedModel, setSelectedModel] = useState<string>("Select Model");
  const [selectedIcon, setSelectedIcon] = useState<SFSymbol>("brain");
  const iconColor = useThemeColor("iconDefault");

  const menuOptions: ContextMenuItem[] = [
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
    <ContextMenu.ContextMenu
      onSelect={(item) => {
        setSelectedModel(item.label);
        setSelectedIcon(item.icon ?? "brain");
      }}
    >
      <ContextMenu.Trigger>
        <IconSymbol name={selectedIcon} size={18} color={iconColor} />
        <ThemedText fontSize={theme.fontSize20}>{selectedModel}</ThemedText>
      </ContextMenu.Trigger>
      <ContextMenu.PopUpView>
        {menuOptions.map((item) => (
          <ContextMenu.Item key={item.label} item={item} />
        ))}
      </ContextMenu.PopUpView>
    </ContextMenu.ContextMenu>
  );
}
