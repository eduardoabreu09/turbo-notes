import { useThemeColor } from "@/hooks/use-theme-color";
import { View } from "react-native";

export default function ModalHeader() {
  const activeContent = useThemeColor("activeContent");

  return (
    <View
      style={{
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 20,
      }}
    >
      <View
        style={{
          width: 100,
          backgroundColor: activeContent,
          height: 5,
          borderRadius: 5,
        }}
      />
    </View>
  );
}
