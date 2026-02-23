import { theme } from "@/constants/theme";
import { useNoteStore } from "@/store/note-store";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "../Themed";
import { IconSymbol } from "../ui/icon-symbol";

type ActionType = "delete" | "share";
type ActionConfig = {
  icon: ComponentProps<typeof IconSymbol>["name"];
  bgColor: string;
  label: string;
  onPress?: () => void;
};

function Option({ config }: { config: ActionConfig }) {
  return (
    <Pressable style={styles.container} onPress={() => config.onPress?.()}>
      <View style={[styles.rightAction, { backgroundColor: config.bgColor }]}>
        <IconSymbol name={config.icon} color="white" size={theme.space32} />
      </View>
      <ThemedText fontSize={theme.fontSize12}>{config.label}</ThemedText>
    </Pressable>
  );
}

export function RightAction({
  prog,
  noteId,
}: {
  prog: SharedValue<number>;
  noteId: string;
}) {
  const deleteNote = useNoteStore((state) => state.removeNoteById);
  const note = useNoteStore((state) => state.getNoteById(noteId));
  const styleAnimation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(prog.value, { duration: 100 }),
      transform: [{ scale: interpolate(prog.value, [0, 1], [0.5, 1]) }],
    };
  });

  const actionsConfig: Record<ActionType, ActionConfig> = {
    delete: {
      icon: "trash",
      bgColor: "red",
      label: "Delete",
      onPress: () => {
        deleteNote(noteId);
      },
    },
    share: {
      icon: "square.and.arrow.up",
      bgColor: theme.color.reactBlue.dark,
      label: "Share",
      onPress: () => {
        const noteContent = note?.content || "";
        const noteFileTitle = note?.title || "Untitled Note";
        const deleteIfExists = (file: File) => {
          if (file.exists) {
            file.delete();
          }
        };
        try {
          const file = new File(Paths.cache, `${noteFileTitle}.md`);
          deleteIfExists(file);
          file.create();
          file.write(noteContent);
          Sharing.shareAsync(file.uri);
        } catch (error) {
          console.error(error);
        }
      },
    },
  };

  return (
    <Animated.View style={[styleAnimation, styles.actionsContainer]}>
      <Option config={actionsConfig.share} />
      <Option config={actionsConfig.delete} />
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    gap: theme.space2,
  },
  actionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space8,
    flexDirection: "row",
    marginTop: theme.space4,
    marginHorizontal: theme.space8,
  },
  rightAction: {
    width: 80,
    height: 40,
    backgroundColor: "red",
    borderRadius: theme.borderRadius32,
    justifyContent: "center",
    alignItems: "center",
  },
});
