import { theme } from "@/constants/theme";
import { useNoteStore } from "@/store/note-store";
import { Note } from "@/types/note";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { LinearTransition } from "react-native-reanimated";
import { useShallow } from "zustand/react/shallow";
import { ListItem } from "./ListItem";

export default function SearchPage() {
  const { notesDict } = useNoteStore(
    useShallow((state) => ({
      notesDict: state.notes,
    })),
  );
  const query = useLocalSearchParams();
  const notes = useMemo(() => {
    const res = (Object.values(notesDict) as Note[]).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    if (query.q) {
      return res.filter((note) =>
        note.title.toLowerCase().includes((query.q as string).toLowerCase()),
      );
    }
    return res;
  }, [notesDict, query]);

  return (
    //TODO: Change to FlashList if performance is needed in the future //
    //  Current Bug with FlashList: when a new note is added, the list scrolls to
    //  top, but the list size bugs out
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Animated.FlatList
        style={{ flex: 1 }}
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ListItem item={item} isLast={item.id === notes.at(-1)?.id} />
        )}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.listContainer}
        itemLayoutAnimation={LinearTransition}
        // ListEmptyComponent={ListEmptyComponent}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: theme.borderRadius20,
    marginHorizontal: theme.space16,
    marginTop: theme.space8,
    overflow: "hidden",
  },
});
