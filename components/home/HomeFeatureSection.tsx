import { ThemedText } from "@/components/Themed";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { HomeFeatureCard } from "../../constants/home-data";

type HomeFeatureSectionProps = {
  features: HomeFeatureCard[];
  expandedFeature: string;
  onToggleFeature: (key: string) => void;
};

export default function HomeFeatureSection({
  features,
  expandedFeature,
  onToggleFeature,
}: HomeFeatureSectionProps) {
  const secondaryTextColor = useThemeColor("textSecondary");
  const borderColor = useThemeColor("border");
  const tertiaryColor = useThemeColor("backgroundTertiary");
  const cardColor = useThemeColor("backgroundSecondary");
  const accentColor = useThemeColor("iconDefault");

  return (
    <Animated.View
      entering={FadeInDown.delay(120).duration(350)}
      style={styles.sectionCard}
    >
      <ThemedText fontSize={theme.fontSize20} fontWeight="bold">
        What you can do
      </ThemedText>

      <View style={{ gap: theme.space8 }}>
        {features.map((feature) => {
          const isExpanded = expandedFeature === feature.key;

          return (
            <Animated.View
              key={feature.key}
              layout={LinearTransition.duration(150)}
              style={[
                styles.featureCard,
                {
                  borderColor,
                  backgroundColor: isExpanded ? tertiaryColor : cardColor,
                },
              ]}
            >
              <Pressable
                onPress={() => {
                  onToggleFeature(feature.key);
                }}
                style={styles.featurePressable}
              >
                <View style={styles.featureTitleRow}>
                  <IconSymbol
                    name={feature.icon}
                    size={22}
                    color={accentColor}
                  />
                  <View style={{ flex: 1, gap: theme.space4 }}>
                    <ThemedText
                      fontSize={theme.fontSize18}
                      fontWeight="semibold"
                    >
                      {feature.title}
                    </ThemedText>
                    <ThemedText
                      fontSize={theme.fontSize14}
                      style={{ color: secondaryTextColor }}
                    >
                      {feature.summary}
                    </ThemedText>
                  </View>
                  <IconSymbol
                    name={isExpanded ? "chevron.up" : "chevron.down"}
                    size={24}
                    color={secondaryTextColor}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <Animated.View
                  entering={FadeInDown.duration(180)}
                  exiting={FadeOut.duration(120)}
                  style={styles.featureDetail}
                >
                  <ThemedText
                    fontSize={theme.fontSize14}
                    style={{ color: secondaryTextColor, lineHeight: 22 }}
                  >
                    {feature.details}
                  </ThemedText>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: theme.space12,
  },
  featureCard: {
    borderRadius: theme.borderRadius12,
    overflow: "hidden",
  },
  featurePressable: {
    padding: theme.space12,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space8,
  },
  featureDetail: {
    paddingHorizontal: theme.space12,
    paddingBottom: theme.space12,
  },
});
