import NotePage from "@/components/note-id";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { Stack, useLocalSearchParams } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function NoteDetails() {
  const backgroundColor = useThemeColor("background");

  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNoteStore((state) => state.getNoteById(id));

  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{
        paddingVertical: theme.space12,
        gap: theme.space12,
      }}
      keyboardDismissMode="on-drag"
    >
      <Stack.Screen
        options={{
          title: `${note?.title || "Note details"}`,
        }}
      />
      <NotePage note={note} />
    </KeyboardAwareScrollView>
  );
}
