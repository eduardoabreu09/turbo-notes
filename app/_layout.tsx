import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import ModalHeader from "@/components/modal-header";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient";
import { Platform } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const headerOptions = Platform.select({
    ios: {
      presentation: "formSheet",
      title: "Modal",
      sheetAllowedDetents: [0.45, 1],
      headerShown: true,
      header: () => <ModalHeader />,
    },
    default: {
      presentation: "formSheet",
      title: "Modal",
      sheetAllowedDetents: [0.55],
      headerShown: true,
      sheetCornerRadius: 42,
      header: () => <ModalHeader />,
    },
  }) as ExtendedStackNavigationOptions;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            ...headerOptions,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
