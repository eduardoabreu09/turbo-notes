import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Note } from "@/types/note";
import { useState } from "react";
import { Keyboard, useWindowDimensions, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import CustomMarkdown from "../CustomMarkdown";
import { ThemedTextInput } from "../Themed";
import { IconSymbol } from "../ui/icon-symbol";

export type NotePageProps = {
  note: Note;
};

function Separator() {
  const bgTertiary = useThemeColor("backgroundTertiary");
  return (
    <View
      style={{
        flex: 1,
        width: 3,
        backgroundColor: bgTertiary,
        zIndex: 1,
      }}
    />
  );
}

export default function NotePage({ note }: NotePageProps) {
  const offset = useSharedValue<number>(0);
  const offsetStart = useSharedValue<number>(0);
  const pressed = useSharedValue<boolean>(false);
  const { height, width } = useWindowDimensions();
  const accentColor = useThemeColor("iconDefault");
  const bgSecondary = useThemeColor("backgroundSecondary");
  const bgTertiary = useThemeColor("backgroundTertiary");

  const [text, setText] = useState(note.content);

  const compWidth = width * 2 - theme.space32;

  const pan = Gesture.Pan()
    .onBegin(() => {
      pressed.value = true;
      scheduleOnRN(() => Keyboard.dismiss());
    })
    .onChange((event) => {
      offset.value = offsetStart.value + event.translationX;
    })
    .onFinalize(() => {
      const distanceFromLeft =
        Math.abs(offset.value) < width / 2 ? 0 : -width + theme.space32;
      offset.value = withSpring(distanceFromLeft);
      offsetStart.value = distanceFromLeft;
      pressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 1.3 : 1) }],
    backgroundColor: pressed.value ? bgSecondary : bgTertiary,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            height: height * 0.8,
            width: compWidth,
            flexDirection: "row",
            paddingHorizontal: theme.space16,
          },
          animatedStyles,
        ]}
      >
        <ThemedTextInput
          style={{ flex: 1 }}
          value={text}
          multiline
          onChangeText={setText}
        />
        <GestureDetector gesture={pan}>
          <View
            style={{
              width: theme.space32,
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Separator />
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  height: "30%",
                  width: theme.space24,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: theme.borderRadius32,
                  zIndex: 2,
                },
                handleStyle,
              ]}
            >
              <IconSymbol
                style={{ transform: [{ scaleY: 1.5 }] }}
                name="chevron.left"
                size={theme.space16}
                color={accentColor}
              />
              <IconSymbol
                style={{ transform: [{ scaleY: 1.5 }] }}
                name="chevron.right"
                size={theme.space16}
                color={accentColor}
              />
            </Animated.View>
            <Separator />
          </View>
        </GestureDetector>
        <View style={{ flex: 1 }}>
          <CustomMarkdown value={text} />
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}
