import CustomMarkdown from "@/components/CustomMarkdown";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

export default function NoteDetails() {
  const backgroundColor = useThemeColor("background");
  const { id } = useLocalSearchParams<{ id: string }>();
  const note = useNoteStore((state) => state.getNoteById(id));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{
        paddingHorizontal: theme.space16,
        paddingVertical: theme.space12,
        gap: theme.space12,
      }}
    >
      <Stack.Screen
        options={{
          title: `${note?.title || "Note details"}`,
          headerBackTitle: "Back",
        }}
      />
      <CustomMarkdown value={note?.content || ""} />
    </ScrollView>
  );
}
