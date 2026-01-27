import { ThemedText, ThemedView } from "@/components/Themed";
import Title from "@/components/Title";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ScrollView, StyleSheet } from "react-native";

export default function SearchIndex() {
  const backgroundColor = useThemeColor("background");
  return (
    <ScrollView style={{ flex: 1, backgroundColor }}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <Title>Search Bar</Title>
        </ThemedView>
        <ThemedText>
          This app includes example code to help you get started.
        </ThemedText>
        {Array.from({ length: 50 }).map((_, index) => (
          <ThemedText key={index}>
            This is some extra filler text to demonstrate scrolling inside the
            Search tab.
          </ThemedText>
        ))}
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
