import { ThemedText, ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { Note } from "@/types/note";
import { ScrollView, StyleSheet, View } from "react-native";

export default function SearchIndex() {
  const backgroundColor = useThemeColor("background");
  const notesDict = useNoteStore((state) => state.notes);
  const notes = Array.from(notesDict.entries());

  const renderItem = (note: Note) => {
    return (
      <View key={note.id} style={{ gap: theme.space4 }}>
        <ThemedText key={note.id}>
          {note.emoji} {note.title}
        </ThemedText>
        <ThemedText>{note.content}</ThemedText>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}></ThemedView>
        {notes.map((note) => renderItem(note[1]))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  container: {
    ...theme.container,
    paddingVertical: theme.space8,
    gap: theme.space16,
  },
});
