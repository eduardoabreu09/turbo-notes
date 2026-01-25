import { ThemedText } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { Platform } from "react-native";

export default function Layout() {
  const router = useRouter();
  const tabBarBackgroundColor = useThemeColor("background");
  const tabBarTintColor = useThemeColor("tabBarTint");

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
          title: "Search",
          headerTitle: () =>
            Platform.OS === "android" ? (
              <ThemedText fontSize={theme.fontSize20} fontWeight="bold">
                Speakers
              </ThemedText>
            ) : undefined,

          headerSearchBarOptions: {
            headerIconColor: tabBarTintColor,
            tintColor: tabBarTintColor,
            textColor: tabBarTintColor,
            hintTextColor: tabBarTintColor,
            placeholder: "Search speakers",
            onChangeText: (event) => {
              router.setParams({
                q: event.nativeEvent.text,
              });
            },
          },
        }}
      />
    </Stack>
  );
}
