import { ThemedPressable, ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import React, {
  ComponentProps,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
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
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
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

  const handlePress = useCallback(() => {
    setIsOpen(false);
    Haptics.selectionAsync();
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      onSelect,
    }),
    [isOpen, setIsOpen, onSelect],
  );

  return (
    <ContextMenuContext.Provider value={value}>
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
  const { isOpen, setIsOpen } = useContextMenu();

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (isOpen) {
      opacity.value = withTiming(0.3, { duration: 250 });
    } else {
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [isOpen, opacity]);

  const handlePress = useCallback(() => {
    setIsOpen(!isOpen);
    Haptics.selectionAsync();
  }, [isOpen, setIsOpen]);

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
  const { isOpen } = useContextMenu();
  const listProgress = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      listProgress.value = withTiming(1, { duration: 250 });
    } else {
      listProgress.value = withTiming(0, { duration: 140 });
    }
  }, [isOpen, listProgress]);

  const listAnimatedStyles = useAnimatedStyle(() => ({
    opacity: listProgress.value,
    transform: [
      {
        translateY: (1 - listProgress.value) * -20,
      },
    ],
  }));

  const pointerEvents = useMemo(() => (isOpen ? "auto" : "none"), [isOpen]);

  return (
    <ThemedView
      pointerEvents={pointerEvents}
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
  const { onSelect, setIsOpen } = useContextMenu();

  const handleSelect = useCallback(
    (item: ContextMenuItem) => {
      onSelect?.(item);
      setIsOpen(false);
      Haptics.selectionAsync();
    },
    [onSelect, setIsOpen],
  );

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
