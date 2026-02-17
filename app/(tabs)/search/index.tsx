import { ThemedText } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { Note } from "@/types/note";
import { Link, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/react/shallow";

export default function SearchIndex() {
  const bgSecondary = useThemeColor("backgroundSecondary");
  const secText = useThemeColor("textSecondary");
  const { hasHydrated, notesDict } = useNoteStore(
    useShallow((state) => ({
      hasHydrated: state.hasHydrated,
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

  const renderItem = ({ index, item }: { index: number; item: Note }) => {
    const isLast = index === notes.length - 1;

    return (
      <Link href={`/note/${item.id}`} asChild>
        <Pressable
          key={item.id}
          style={{
            marginHorizontal: theme.space16,
            paddingVertical: theme.space4,
          }}
        >
          <View
            style={{
              borderBottomWidth: isLast ? 0 : 1,
              paddingBottom: theme.space8,
              borderColor: "grey",
              gap: theme.space4,
            }}
          >
            <View style={styles.titleContainer}>
              {item.emoji && (
                <ThemedText fontSize={theme.fontSize24}>
                  {item.emoji}
                </ThemedText>
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
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    //TODO: Change to FlashList if performance is needed in the future
    // Current Bug with FlashList: when a new note is added, the list scrolls to top, but the list size bugs out
    <FlatList
      style={{ flex: 1 }}
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.listContainer,
        {
          backgroundColor: bgSecondary,
        },
      ]}
      // ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: theme.borderRadius20,
    marginHorizontal: theme.space16,
    paddingTop: theme.space8,
  },
  titleContainer: {
    flexDirection: "row",
    gap: theme.space8,
    alignItems: "center",
  },
});
