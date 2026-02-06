import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import clampProgress from "@/utils/clamp-progress";
import { useEffect } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "../Themed";

type ProgressBarProps = {
  progress: number;
  text?: string;
  showPercentage?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ProgressBar({
  progress,
  text,
  showPercentage = true,
  style,
}: ProgressBarProps) {
  const clampedProgress = clampProgress(progress);
  const trackColor = useThemeColor("border");
  const fillColor = useThemeColor("iconDefault");
  const percentage = `${Math.round(clampedProgress)}%`;
  const animatedProgress = useSharedValue(clampedProgress);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [animatedProgress, clampedProgress]);

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  return (
    <View style={style}>
      {(text || showPercentage) && (
        <View style={styles.header}>
          {text ? (
            <ThemedText fontSize={theme.fontSize14} fontWeight="semibold">
              {text}
            </ThemedText>
          ) : (
            <View />
          )}
          {showPercentage && (
            <ThemedText fontSize={theme.fontSize14}>{percentage}</ThemedText>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.fill,
            fillStyle,
            {
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.space4,
  },
  track: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
