import { theme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useThemeColor(colorName: keyof typeof theme.color) {
  const selectedTheme = useColorScheme() ?? "light";

  return theme.color[colorName][selectedTheme];
}
