import Title from "@/components/Title";
import { useThemeColor } from "@/hooks/use-theme-color";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function Layout() {
  const tabBarBackgroundColor = useThemeColor("background");

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable()
              ? "transparent"
              : tabBarBackgroundColor,
          },
          headerLargeTitle: true,
          title: "Add Note",
          headerTitle: () =>
            Platform.OS === "android" ? <Title>Add Note</Title> : undefined,
        }}
      />
    </Stack>
  );
}
