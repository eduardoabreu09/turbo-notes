import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { ComponentProps, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedPressable, ThemedText, ThemedView } from "../Themed";
import { IconSymbol } from "./icon-symbol";

type IconName = ComponentProps<typeof IconSymbol>["name"];

export type ContextMenuItem<T = string> = {
  label: string;
  value: T;
  icon?: IconName;
};

export type ContextMenuProps<T = string> = {
  title?: string;
  items: ContextMenuItem<T>[];
  onSelect?: (item: ContextMenuItem<T>) => void;
  icon?: IconName;
};

export default function ContextMenu<T = string>({
  title = "Select Item",
  items,
  icon,
  onSelect = () => {},
}: ContextMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const iconColor = useThemeColor("iconDefault");
  const borderColor = useThemeColor("border");

  const opacity = useSharedValue(1);
  const listProgress = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const listAnimatedStyles = useAnimatedStyle(() => ({
    opacity: listProgress.value,
    transform: [
      {
        translateY: (1 - listProgress.value) * -20,
      },
    ],
  }));

  const handlePress = () => {
    if (isOpen) {
      listProgress.value = withTiming(0, { duration: 140 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      listProgress.value = withTiming(1, { duration: 140 });
      opacity.value = withTiming(0.3, { duration: 250 });
    }
    setIsOpen((prev) => !prev);
    Haptics.selectionAsync();
  };

  const handleSelect = (item: ContextMenuItem<T>) => {
    onSelect(item);
    setIsOpen(false);
    listProgress.value = withTiming(0, { duration: 140 });
    opacity.value = withTiming(1, { duration: 250 });
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      {isOpen && <Pressable style={theme.backdrop} onPress={handlePress} />}

      <ThemedPressable
        style={[styles.titleContainer, animatedStyles]}
        onPress={handlePress}
        animated
      >
        {icon && (
          <IconSymbol name={icon} size={theme.fontSize24} color={iconColor} />
        )}
        <ThemedText fontSize={theme.fontSize18}>{title}</ThemedText>
      </ThemedPressable>
      <ThemedView
        style={[
          styles.listContainer,
          theme.dropShadow,
          { borderColor: borderColor },
          listAnimatedStyles,
        ]}
        animated
      >
        {items.map((item) => (
          <ThemedPressable
            key={item.label}
            onPress={() => handleSelect(item)}
            style={styles.titleContainer}
          >
            {item.icon && (
              <IconSymbol
                name={item.icon}
                size={theme.fontSize24}
                color={iconColor}
              />
            )}
            <ThemedText fontSize={theme.fontSize18}>{item.label}</ThemedText>
          </ThemedPressable>
        ))}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  titleContainer: {
    paddingVertical: theme.space12,
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
  },
  listContainer: {
    position: "absolute",
    padding: theme.space12,
    top: 30,
    left: 0,
    zIndex: 10,
    borderRadius: theme.borderRadius12,
    borderWidth: 1,
  },
});
