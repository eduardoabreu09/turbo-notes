import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Note } from "@/types/note";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "../Themed";
import { RightAction } from "./RightAction";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ListItem({ item, isLast }: { item: Note; isLast?: boolean }) {
  const bgSecondary = useThemeColor("backgroundSecondary");
  const bgTertiary = useThemeColor("backgroundTertiary");
  const secText = useThemeColor("textSecondary");
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const router = useRouter();

  const opacity = useDerivedValue(
    () => withTiming(isLast ? 0 : isSwipeOpen ? 0 : 1, { duration: 300 }),
    [isLast, isSwipeOpen],
  );

  const bgColor = useDerivedValue(
    () => withTiming(isSwipeOpen ? 1 : 0, { duration: 300 }),
    [isSwipeOpen],
  );

  const styleAnimation = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgColor.value,
      [0, 1],
      [bgSecondary, bgTertiary],
    ),
    borderRadius: interpolate(bgColor.value, [0, 1], [0, theme.borderRadius20]),
  }));

  const handleSwipeableOpenStartDrag = useCallback(() => {
    setIsSwipeOpen(true);
  }, []);

  const handleSwipeableWillClose = useCallback(() => {
    setIsSwipeOpen(false);
  }, []);

  return (
    <ReanimatedSwipeable
      friction={2}
      overshootFriction={10}
      renderRightActions={(prog, drag) => (
        <RightAction prog={prog} noteId={item.id} />
      )}
      rightThreshold={40}
      enableTrackpadTwoFingerGesture
      onSwipeableOpenStartDrag={handleSwipeableOpenStartDrag}
      onSwipeableWillClose={handleSwipeableWillClose}
    >
      <AnimatedPressable
        onPress={() => {
          router.navigate(`/(tabs)/search/note/${item.id}`);
        }}
        style={[
          bgStyle,
          {
            paddingHorizontal: theme.space16,
            paddingTop: theme.space8,
            gap: theme.space4,
          },
        ]}
      >
        <View style={styles.titleContainer}>
          {item.emoji && (
            <ThemedText fontSize={theme.fontSize24}>{item.emoji}</ThemedText>
          )}
          <ThemedText fontSize={theme.fontSize18} fontWeight={600}>
            {item.title}
          </ThemedText>
        </View>
        <ThemedText fontSize={theme.fontSize16} style={{ color: secText }}>
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(item.createdAt)}
        </ThemedText>
        <Animated.View style={[styles.separator, styleAnimation]} />
      </AnimatedPressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: theme.space8,
    alignItems: "center",
  },
  separator: {
    width: "100%",
    backgroundColor: "grey",
    height: 1,
    marginTop: theme.space4,
  },
});
