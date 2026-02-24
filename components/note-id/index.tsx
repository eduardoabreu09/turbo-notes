import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { Note } from "@/types/note";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
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
import { ThemedPressable, ThemedText, ThemedTextInput } from "../Themed";
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
  const updateNote = useNoteStore((state) => state.updateNote);
  const { height, width } = useWindowDimensions();
  const iconColor = useThemeColor("iconDefault");
  const bgSecondary = useThemeColor("backgroundSecondary");
  const bgTertiary = useThemeColor("backgroundTertiary");

  const [text, setText] = useState(note.content);
  const isDirty = text !== note.content;

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

  const handleSave = () => {
    const success = updateNote(note.id, { ...note, content: text });
    if (!success) {
      Alert.alert("Could not save note");
    }
  };

  const handleReset = () => {
    setText(note.content);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          gap: theme.space12,
        }}
      >
        <Animated.View
          style={[
            {
              height: height * 0.67,
              width: compWidth,
              flexDirection: "row",
              paddingHorizontal: theme.space16,
            },
            animatedStyles,
          ]}
        >
          <ThemedTextInput
            style={{ flex: 1, paddingBottom: 200 }}
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
                  color={iconColor}
                />
                <IconSymbol
                  style={{ transform: [{ scaleY: 1.5 }] }}
                  name="chevron.right"
                  size={theme.space16}
                  color={iconColor}
                />
              </Animated.View>
              <Separator />
            </View>
          </GestureDetector>
          <ScrollView style={{ flex: 1 }}>
            <CustomMarkdown value={text} />
          </ScrollView>
        </Animated.View>
        <View
          style={{
            flexDirection: "row",
            gap: theme.space12,
            paddingHorizontal: theme.space16,
          }}
        >
          <ThemedPressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: bgSecondary,
              opacity: isDirty ? 1 : 0.45,
              paddingVertical: theme.space12,
              borderRadius: theme.borderRadius10,
            }}
            disabled={!isDirty}
            onPress={handleReset}
          >
            <ThemedText fontSize={theme.fontSize16} fontWeight={600}>
              Reset
            </ThemedText>
          </ThemedPressable>
          <ThemedPressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: iconColor,
              opacity: isDirty ? 1 : 0.45,
              paddingVertical: theme.space12,
              borderRadius: theme.borderRadius10,
            }}
            disabled={!isDirty}
            onPress={handleSave}
          >
            <ThemedText fontSize={theme.fontSize16} fontWeight={600}>
              Save
            </ThemedText>
          </ThemedPressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
