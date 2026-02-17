import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { KeyboardProvider } from "react-native-keyboard-controller";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // TODO: If needed, use this header options for modal
  // const headerOptions = Platform.select<ExtendedStackNavigationOptions>({
  //   ios: {
  //     presentation: "formSheet",
  //     title: "",
  //     sheetAllowedDetents: [0.45, 1],
  //     headerShown: false,
  //     sheetGrabberVisible: true,
  //     contentStyle: {
  //       backgroundColor: isLiquidGlassAvailable()
  //         ? "transparent"
  //         : tabBarBackgroundColor,
  //     },
  //     headerStyle: {
  //       backgroundColor: "transparent",
  //     },
  //   },
  //   default: {
  //     presentation: "formSheet",
  //     title: "Modal",
  //     sheetAllowedDetents: [0.55],
  //     headerShown: true,
  //     sheetCornerRadius: 42,
  //     header: () => <ModalHeader />,
  //     contentStyle: {
  //       backgroundColor: tabBarBackgroundColor,
  //     },
  //   },
  //   web: {
  //     presentation: "modal",
  //     title: "Modal",
  //     headerShown: true,
  //   },
  // });

  return (
    <KeyboardProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="note/[id]" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
