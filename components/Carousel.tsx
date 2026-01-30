import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Asset } from "@/types/asset";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { ThemedPressable, ThemedText, ThemedView } from "./Themed";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const defaultWidth = 0.8 * width;
const defaultHeight = 0.4 * height;

export type CarouselProps = {
  photos: Asset[];
  onPhotoRemoved?: (asset: Asset) => void;
};

function ListEmptyComponent() {
  const secondaryColor = useThemeColor("backgroundSecondary");

  return (
    <ThemedView
      style={[
        style.container,
        {
          height: defaultHeight / 2,
          width: defaultWidth,
          borderRadius: theme.borderRadius20,
          padding: theme.space16,
        },
        { backgroundColor: secondaryColor },
      ]}
    >
      <ThemedText
        fontFamily="mono"
        fontWeight="bold"
        fontSize={theme.fontSize28}
      >
        Add photos to see them here!
      </ThemedText>
    </ThemedView>
  );
}

export default function Carousel({ photos, onPhotoRemoved }: CarouselProps) {
  const renderItem = ({ item, index }: { item: Asset; index: number }) => {
    return (
      <Animated.View
        entering={SlideInRight.duration(150).damping(10)}
        exiting={SlideOutRight.duration(300).damping(10)}
        style={{
          position: "relative",
          height: defaultHeight,
          width: defaultWidth,
        }}
      >
        <Image
          style={{
            flex: 1,
            borderRadius: theme.borderRadius20,
          }}
          source={{ uri: item.uri }}
          contentFit="fill"
        />
        <ThemedPressable
          hitSlop={20}
          style={style.pressableContainer}
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
    <View style={style.container}>
      <FlatList
        data={photos}
        snapToInterval={defaultWidth + theme.space12}
        contentContainerStyle={{
          gap: theme.space12,
          paddingHorizontal: theme.space24,
        }}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.uri}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const style = StyleSheet.create({
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
});
