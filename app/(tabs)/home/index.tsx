import HomeFeatureSection from "@/components/home/HomeFeatureSection";
import HomeHeroCard from "@/components/home/HomeHeroCard";
import { HOME_FEATURES } from "@/constants/home-data";
import { theme } from "@/constants/theme";
import {
  useInitModelCatalog,
  useModelCatalogModels,
} from "@/hooks/use-model-catalog";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteStore } from "@/store/note-store";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
  useInitModelCatalog();

  const router = useRouter();
  const backgroundColor = useThemeColor("background");
  const notes = useNoteStore((state) => state.notes);
  const { models } = useModelCatalogModels();
  const noteCountLabel = notes ? Object.keys(notes).length.toString() : "0";

  const downloadedModelCount = useMemo(
    () => models.filter((model) => model.isDownloaded).length,
    [models],
  );

  const [expandedFeature, setExpandedFeature] = useState<string>("");

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={{
        paddingHorizontal: theme.space16,
        paddingVertical: Platform.OS !== "ios" ? theme.space64 : 0,
        gap: theme.space16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(350)}>
        <HomeHeroCard
          noteCountLabel={noteCountLabel}
          downloadedModelCount={downloadedModelCount}
          totalModelCount={models.length}
          onCreateNote={() => {
            router.push("/(tabs)/home/add-note");
          }}
          onSearchNotes={() => {
            router.push("/(tabs)/search");
          }}
        />
      </Animated.View>

      <HomeFeatureSection
        features={HOME_FEATURES}
        expandedFeature={expandedFeature}
        onToggleFeature={(key) => {
          setExpandedFeature((current) => (current === key ? "" : key));
        }}
      />
    </ScrollView>
  );
}
