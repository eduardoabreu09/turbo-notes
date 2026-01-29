import { ThemedPressable, ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import React, {
  ComponentProps,
  createContext,
  use,
  useEffect,
  useState,
} from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { IconSymbol } from "../icon-symbol";

type IconName = ComponentProps<typeof IconSymbol>["name"];

export type ContextMenuItem = {
  label: string;
  value: string;
  icon?: IconName;
};

export type ContextMenuProps = {
  onSelect?: (item: ContextMenuItem) => void;
  children?: React.ReactNode;
};

type ContextMenuContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
} & ContextMenuProps;

const ContextMenuContext = createContext<ContextMenuContextProps | null>(null);

function useContextMenu() {
  const context = use(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within a <ContextMenu />");
  }

  return context;
}

function ContextMenu({ children, onSelect = () => {} }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(false);
    Haptics.selectionAsync();
  };

  return (
    <ContextMenuContext.Provider
      value={{
        open: isOpen,
        setOpen: setIsOpen,
        onSelect,
      }}
    >
      <View style={styles.container}>
        {isOpen && <Pressable style={theme.backdrop} onPress={handlePress} />}
        {children}
      </View>
    </ContextMenuContext.Provider>
  );
}

type TriggerProps = {
  children?: React.ReactNode;
};

function Trigger({ children }: TriggerProps) {
  const opacity = useSharedValue(1);
  const { open, setOpen } = useContextMenu();

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (open) {
      opacity.value = withTiming(0.3, { duration: 250 });
    } else {
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [open, opacity]);

  const handlePress = () => {
    setOpen(!open);
    Haptics.selectionAsync();
  };

  return (
    <ThemedPressable
      style={[styles.titleContainer, animatedStyles]}
      onPress={handlePress}
      animated
    >
      {children}
    </ThemedPressable>
  );
}

type PopUpViewProps = {
  children?: React.ReactNode;
  propStyle?: StyleProp<ViewStyle>;
};

function PopUpView({ children, propStyle }: PopUpViewProps) {
  const borderColor = useThemeColor("border");
  const { open } = useContextMenu();
  const listProgress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      listProgress.value = withTiming(1, { duration: 250 });
    } else {
      listProgress.value = withTiming(0, { duration: 140 });
    }
  }, [open, listProgress]);

  const listAnimatedStyles = useAnimatedStyle(() => ({
    opacity: listProgress.value,
    transform: [
      {
        translateY: (1 - listProgress.value) * -20,
      },
    ],
  }));

  return (
    <ThemedView
      pointerEvents={open ? "auto" : "none"}
      style={[
        styles.listContainer,
        theme.dropShadow,
        { borderColor: borderColor },
        propStyle,
        listAnimatedStyles,
      ]}
      animated
    >
      {children}
    </ThemedView>
  );
}

function Item({ item }: { item: ContextMenuItem }) {
  const iconColor = useThemeColor("iconDefault");
  const { onSelect, setOpen } = useContextMenu();

  const handleSelect = (item: ContextMenuItem) => {
    onSelect?.(item);
    setOpen(false);
    Haptics.selectionAsync();
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "visible",
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

export { ContextMenu, Item, PopUpView, Trigger };
