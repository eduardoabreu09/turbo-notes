import { ThemedText } from "@/components/Themed";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type IconName = ComponentProps<typeof IconSymbol>["name"];

type HomeActionButtonProps = {
  icon: IconName;
  title: string;
  onPress: () => void;
};

export default function HomeActionButton({
  icon,
  title,
  onPress,
}: HomeActionButtonProps) {
  const textColor = useThemeColor("text");
  const borderColor = useThemeColor("border");
  const backgroundColor = useThemeColor("backgroundTertiary");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor,
          backgroundColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <IconSymbol name={icon} size={20} color={textColor} />
      <View style={{ gap: 2 }}>
        <ThemedText fontSize={theme.fontSize16} fontWeight="semibold">
          {title}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: theme.borderRadius12,
    paddingVertical: theme.space12,
    paddingHorizontal: theme.space12,
    gap: theme.space8,
  },
});
