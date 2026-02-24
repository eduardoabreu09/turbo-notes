import NotePage from "@/components/note-id";
import { ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useNoteStore } from "@/store/note-store";
import { Stack, useLocalSearchParams } from "expo-router";

export default function NoteDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNoteStore((state) => state.getNoteById(id));

  return (
    <ThemedView
      style={{
        flex: 1,
        paddingVertical: theme.space12,
        gap: theme.space12,
      }}
    >
      <Stack.Screen
        options={{
          title: `${note?.title || "Note details"}`,
        }}
      />
      {note ? (
        <NotePage note={note} />
      ) : (
        <ThemedText
          style={{
            paddingHorizontal: theme.space16,
          }}
        >
          Note not found
        </ThemedText>
      )}
    </ThemedView>
  );
}
