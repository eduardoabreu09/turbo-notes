import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Asset } from "@/types/asset";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { ThemedPressable, ThemedText, ThemedView } from "./Themed";

export type CarouselProps = {
  photos: Asset[];
  onPhotoRemoved?: (asset: Asset) => void;
};

function ListEmptyComponent() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const secondaryColor = useThemeColor("backgroundSecondary");

  return (
    <ThemedView
      style={[
        styles.container,
        {
          height: screenHeight * 0.4,
          width: screenWidth * 0.8,
          borderRadius: theme.borderRadius20,
          padding: theme.space16,
        },
        { backgroundColor: secondaryColor },
      ]}
      animated
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
    >
      <ThemedText
        fontFamily="mono"
        fontWeight="bold"
        fontSize={theme.fontSize28}
        style={{ textAlign: "center" }}
      >
        Add photos to see them here!
      </ThemedText>
    </ThemedView>
  );
}

export default function Carousel({ photos, onPhotoRemoved }: CarouselProps) {
  const { width: screenWidth } = useWindowDimensions();

  const renderItem = ({ item, index }: { item: Asset; index: number }) => {
    return (
      <Animated.View
        entering={SlideInRight.duration(150).damping(10)}
        exiting={SlideOutRight.duration(300).damping(10)}
        style={[styles.itemContainer, { width: screenWidth * 0.8 }]}
      >
        <Image
          style={styles.image}
          source={{ uri: item.uri }}
          contentFit="fill"
        />
        <ThemedPressable
          hitSlop={20}
          style={styles.pressableContainer}
          onPress={() => {
            onPhotoRemoved?.(item);
            Haptics.impactAsync();
          }}
        >
          <ThemedText>X</ThemedText>
        </ThemedPressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        style={{ flex: 1 }}
        data={photos}
        keyExtractor={(item) => item.uri}
        horizontal
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 0,
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth * 0.8 - 10}
        decelerationRate="fast"
        scrollEventThrottle={16}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressableContainer: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "red",
    height: 32,
    width: 32,
    zIndex: 1,
    borderRadius: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    flex: 1,
    borderRadius: theme.borderRadius20,
  },
});
