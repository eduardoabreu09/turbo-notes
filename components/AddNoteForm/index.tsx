import AddPhoto from "@/components/AddPhoto";
import SelectModel from "@/components/SelectModel";
import { ThemedView } from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useInitModelCatalog } from "@/hooks/use-model-catalog";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  createNoteFormStore,
  NoteFormContext,
  useNoteForm,
} from "@/store/note-form-store";
import { Asset, MAX_PHOTOS } from "@/types/asset";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useShallow } from "zustand/react/shallow";
import Carousel from "../Carousel";
import PromptInput from "./PromptInput";
import TitleInput from "./TitleInput";

function Header() {
  const { photos, setPhotos } = useNoteForm(
    useShallow((state) => ({
      photos: state.photos,
      setPhotos: state.setPhotos,
    })),
  );

  const handlePhotoAdded = useCallback(
    (assets: Asset[]) => {
      const toAdd = [...photos, ...assets];
      const start = Math.max(toAdd.length - MAX_PHOTOS, 0);
      const end = start + MAX_PHOTOS;

      setPhotos([...toAdd.slice(start, end)]);
    },
    [photos, setPhotos],
  );

  return (
    <ThemedView style={styles.headerContainer}>
      <TitleInput />
      <ThemedView style={styles.buttonsContainer}>
        <SelectModel />
        <AddPhoto onPhotoAdded={handlePhotoAdded} />
      </ThemedView>
    </ThemedView>
  );
}

function FormCarousel() {
  const { photos, setPhotos } = useNoteForm(
    useShallow((state) => ({
      photos: state.photos,
      setPhotos: state.setPhotos,
    })),
  );

  const handlePhotoRemoved = useCallback(
    (asset: Asset) => {
      setPhotos(photos.filter((photo) => photo.uri !== asset.uri));
    },
    [photos, setPhotos],
  );

  return <Carousel photos={photos} onPhotoRemoved={handlePhotoRemoved} />;
}

export default function AddNoteForm() {
  useInitModelCatalog();

  const backgroundColor = useThemeColor("background");
  const [store] = useState(() => createNoteFormStore());

  return (
    <NoteFormContext.Provider value={store}>
      <KeyboardAwareScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor }}
        disableScrollOnKeyboardHide
        keyboardDismissMode="on-drag"
        bottomOffset={20}
      >
        <ThemedView style={styles.container}>
          <Header />
          <FormCarousel />
          <PromptInput />
        </ThemedView>
      </KeyboardAwareScrollView>
    </NoteFormContext.Provider>
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
  headerContainer: {
    gap: theme.space4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
