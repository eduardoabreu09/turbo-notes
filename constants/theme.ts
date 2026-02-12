/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import * as Device from "expo-device";
import { Platform, type ViewStyle } from "react-native";

const SPACE_SCALE = 1.33;
const FONT_SCALE = 1.2;

const isIpad = Device.osName === "iPadOS";
export const spaceScale = (value: number) =>
  isIpad ? Math.round(value * SPACE_SCALE) : value;
const fontScale = (size: number) =>
  isIpad ? Math.round(size * FONT_SCALE) : size;

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export type FontFamily = keyof typeof Fonts;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const theme = {
  colorRed: "#FF0000",
  colorWhite: "#FFFFFF",
  colorBlack: "#000000",
  colorLightGreen: "#9BDFB1",
  colorDarkGreen: "#1AC9A2",
  colorGrey: "#ADB5BD",

  color: {
    reactBlue: {
      light: "#087EA4",
      dark: "#58C4DC",
    },
    transparent: {
      light: "rgba(255,255,255,0)",
      dark: "rgba(0,0,0,0)",
    },
    text: { light: "#121212", dark: "#FFFFFF" },
    textSecondary: { light: "#606060", dark: "#CCCCCC" },
    background: { light: "#FFFFFF", dark: "#000000" },
    backgroundSecondary: {
      light: "#f1f1f1",
      dark: "#242424",
    },
    backgroundTertiary: {
      light: "#f5f5f5",
      dark: "#141414",
    },
    backgroundElement: {
      light: "#F1F1F1",
      dark: "#141414",
    },
    border: { light: "#D9D9D0", dark: "#363A3F" },
    tabBarTint: {
      light: "#000",
      dark: "#FFF",
    },
    activeContent: {
      light: "rgba(0,0,0, 0.3)",
      dark: "rgba(255,255,255, 0.3)",
    },
    iconDefault: {
      light: tintColorLight,
      dark: tintColorLight,
    },
  },

  space2: spaceScale(2),
  space4: spaceScale(4),
  space8: spaceScale(8),
  space12: spaceScale(12),
  space16: spaceScale(16),
  space24: spaceScale(24),
  space32: spaceScale(32),
  space64: spaceScale(64),

  fontSize10: fontScale(10),
  fontSize12: fontScale(12),
  fontSize14: fontScale(14),
  fontSize16: fontScale(16),
  fontSize18: fontScale(18),
  fontSize20: fontScale(20),
  fontSize24: fontScale(24),
  fontSize28: fontScale(28),
  fontSize32: fontScale(32),
  fontSize34: fontScale(34),
  fontSize36: fontScale(36),
  fontSize42: fontScale(42),

  borderRadius4: 4,
  borderRadius6: 6,
  borderRadius10: 10,
  borderRadius12: 12,
  borderRadius20: 20,
  borderRadius32: 32,
  borderRadius34: 34,
  borderRadius40: 40,
  borderRadius45: 45,
  borderRadius80: 80,

  dropShadow: {
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
  },

  container: {
    flex: 1,
    paddingHorizontal: spaceScale(16),
  } satisfies ViewStyle,

  backdrop: {
    position: "absolute",
    height: 10000,
    width: 10000,
    top: -5000,
    left: -5000,
    backgroundColor: "transparent",
    zIndex: 5,
  } satisfies ViewStyle,
};
