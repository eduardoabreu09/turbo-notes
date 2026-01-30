import { theme } from "@/constants/theme";
import { useNoteForm } from "@/hooks/use-note-form";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ModelOptions } from "@/types/model";
import { useEffect, useMemo } from "react";
import { ThemedText } from "../Themed";
import * as ContextMenu from "../ui/ContextMenu";
import { IconSymbol } from "../ui/icon-symbol";

export type SelectModelProps = {
  menuOptions: ContextMenu.ContextMenuItem[];
};

export default function BaseSelectModel({ menuOptions }: SelectModelProps) {
  const {
    state: { model },
    actions: { update },
  } = useNoteForm();

  useEffect(() => {
    if (!model) {
      update((current) => ({
        ...current,
        model: menuOptions[0].value as ModelOptions,
      }));
    }
  });

  const iconColor = useThemeColor("iconDefault");

  const selectedOption = useMemo(() => {
    if (!model) {
      return menuOptions[0];
    }
    return menuOptions.find((option) => option.value === model);
  }, [model, menuOptions]);

  return (
    <ContextMenu.ContextMenu
      onSelect={(item) => {
        update((current) => ({
          ...current,
          model: item.value as ModelOptions,
        }));
      }}
      options={menuOptions}
      optionsStyle={{ width: 200 }}
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
    </ContextMenu.ContextMenu>
  );
}
