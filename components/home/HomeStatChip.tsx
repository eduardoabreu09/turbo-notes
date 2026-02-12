import { ThemedText } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

type HomeStatChipProps = {
  label: string;
  value: string;
};

export default function HomeStatChip({ label, value }: HomeStatChipProps) {
  const accentColor = useThemeColor("iconDefault");
  const tertiaryColor = useThemeColor("backgroundTertiary");

  return (
    <View style={[styles.container, { backgroundColor: tertiaryColor }]}>
      <ThemedText fontSize={theme.fontSize12} style={{ opacity: 0.7 }}>
        {label}
      </ThemedText>
      <ThemedText
        fontSize={theme.fontSize24}
        fontWeight="bold"
        style={{ color: accentColor }}
      >
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: theme.borderRadius12,
    padding: theme.space12,
    gap: theme.space4,
  },
});
