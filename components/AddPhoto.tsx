import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedText } from "./Themed";
import * as ContextMenu from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenu";
import { IconSymbol } from "./ui/icon-symbol";

export default function AddPhoto() {
  const iconColor = useThemeColor("iconDefault");

  const menuOptions: ContextMenuItem[] = [
    {
      icon: "camera",
      label: "Take Photo",
      value: "camera",
    },
    {
      icon: "camera.viewfinder",
      label: "From Gallery",
      value: "gallery",
    },
  ];

  return (
    <ContextMenu.ContextMenu
      onSelect={(item) => {
        console.log(item);
      }}
      options={menuOptions}
      optionsStyle={{ width: 175, left: -50 }}
    >
      <ContextMenu.Trigger>
        <IconSymbol name={"plus"} size={20} color={iconColor} />
        <ThemedText fontSize={theme.fontSize20}>Add Photo</ThemedText>
      </ContextMenu.Trigger>
    </ContextMenu.ContextMenu>
  );
}
