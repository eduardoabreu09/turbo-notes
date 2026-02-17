import { ThemedText } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";
import HomeActionButton from "./HomeActionButton";
import HomeStatChip from "./HomeStatChip";

type HomeHeroCardProps = {
  noteCountLabel: string;
  downloadedModelCount: number;
  totalModelCount: number;
  onCreateNote: () => void;
  onSearchNotes: () => void;
};

export default function HomeHeroCard({
  noteCountLabel,
  downloadedModelCount,
  totalModelCount,
  onCreateNote,
  onSearchNotes,
}: HomeHeroCardProps) {
  const secondaryTextColor = useThemeColor("textSecondary");
  return (
    <View style={styles.heroCard}>
      <ThemedText fontFamily="mono" fontSize={theme.fontSize34}>
        TURBO NOTES
      </ThemedText>
      <ThemedText
        fontSize={theme.fontSize16}
        style={{ color: secondaryTextColor, lineHeight: 24 }}
      >
        Capture ideas with photos, run local AI models, and keep everything
        searchable in one place.
      </ThemedText>
      <ThemedText
        fontSize={theme.fontSize16}
        style={{ color: secondaryTextColor, lineHeight: 20 }}
      >
        Privacy first: AI runs on-device, with no cloud processing and no
        internet required after models are downloaded.
      </ThemedText>

      <View style={styles.statRow}>
        <HomeStatChip label="Notes saved" value={noteCountLabel} />
        <HomeStatChip
          label="Models ready"
          value={`${downloadedModelCount}/${totalModelCount}`}
        />
      </View>

      <View style={styles.ctaRow}>
        <HomeActionButton
          icon="plus.app"
          title="Create Note"
          onPress={onCreateNote}
        />
        <HomeActionButton
          icon="magnifyingglass"
          title="Search Notes"
          onPress={onSearchNotes}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.space12,
  },
  statRow: {
    flexDirection: "row",
    gap: theme.space8,
  },
  ctaRow: {
    flexDirection: "row",
    gap: theme.space8,
  },
});
