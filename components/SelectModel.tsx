import { theme } from "@/constants/theme";
import { useNoteForm } from "@/hooks/use-note-form";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ModelOptions } from "@/types/model";
import { useMemo } from "react";
import { ThemedText } from "./Themed";
import * as ContextMenu from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenu";
import { IconSymbol } from "./ui/icon-symbol";

export default function SelectModel() {
  const {
    state: { model },
    actions: { update },
  } = useNoteForm();

  const iconColor = useThemeColor("iconDefault");

  const menuOptions: ContextMenuItem[] = useMemo(
    () => [
      {
        icon: "brain",
        label: "LLaMA Model",
        value: "llama",
      },
    ],
    [],
  );

  const selectedOption = useMemo(
    () => menuOptions.find((option) => option.value === model),
    [model, menuOptions],
  );

  return (
    <ContextMenu.ContextMenu
      onSelect={(item) => {
        update((current) => ({
          ...current,
          model: item.value as ModelOptions,
        }));
      }}
    >
      <ContextMenu.Trigger>
        <IconSymbol
          name={selectedOption?.icon ?? "brain"}
          size={20}
          color={iconColor}
        />
        <ThemedText fontSize={theme.fontSize20}>
          {selectedOption?.label ?? "Select Model"}
        </ThemedText>
      </ContextMenu.Trigger>
      <ContextMenu.PopUpView propStyle={{ width: 200 }}>
        {menuOptions.map((item) => (
          <ContextMenu.Item key={item.label} item={item} />
        ))}
      </ContextMenu.PopUpView>
    </ContextMenu.ContextMenu>
  );
}
