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
      label: "From Camera Roll",
      value: "gallery",
    },
  ];

  return (
    <ContextMenu.ContextMenu onSelect={() => {}}>
      <ContextMenu.Trigger>
        <IconSymbol name={"plus"} size={18} color={iconColor} />
        <ThemedText fontSize={theme.fontSize20}>Add Photo</ThemedText>
      </ContextMenu.Trigger>
      <ContextMenu.PopUpView>
        {menuOptions.map((item) => (
          <ContextMenu.Item key={item.label} item={item} />
        ))}
      </ContextMenu.PopUpView>
    </ContextMenu.ContextMenu>
  );
}
