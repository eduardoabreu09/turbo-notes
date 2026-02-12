import { ThemedView } from "@/components/Themed";
import HomeFeatureSection from "@/components/home/HomeFeatureSection";
import HomeHeroCard from "@/components/home/HomeHeroCard";
import { HOME_FEATURES } from "@/components/home/home-data";
import { theme } from "@/constants/theme";
import {
  useInitModelCatalog,
  useModelCatalogModels,
} from "@/hooks/use-model-catalog";
import { useNoteStore } from "@/store/note-store";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
  useInitModelCatalog();

  const router = useRouter();

  const noteCount = useNoteStore((state) => state.notes.size);
  const { models } = useModelCatalogModels();

  const downloadedModelCount = useMemo(
    () => models.filter((model) => model.isDownloaded).length,
    [models],
  );

  const [expandedFeature, setExpandedFeature] = useState<string>("");

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: theme.space16,
          paddingVertical: Platform.OS !== "ios" ? theme.space64 : 0,
          gap: theme.space16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(350)}>
          <HomeHeroCard
            noteCount={noteCount}
            downloadedModelCount={downloadedModelCount}
            totalModelCount={models.length}
            onCreateNote={() => {
              router.push("/(tabs)/add-note");
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
    </ThemedView>
  );
}
