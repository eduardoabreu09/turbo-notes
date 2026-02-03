import AddPhoto from "@/components/AddPhoto";
import SelectModel from "@/components/SelectModel";
import {
  ThemedPressable,
  ThemedText,
  ThemedTextInput,
  ThemedView,
} from "@/components/Themed";
import { theme } from "@/constants/theme";
import { useAIModel } from "@/hooks/use-ai-model";
import { NoteFormContext, useNoteForm } from "@/hooks/use-note-form";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Asset, MAX_PHOTOS } from "@/types/asset";
import { ModelOptions } from "@/types/model";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { FadeIn, FadeOut } from "react-native-reanimated";
import Carousel from "../Carousel";
import { IconSymbol } from "../ui/icon-symbol";

export type NoteState = {
  title: string;
  prompt?: string;
  photos: Asset[];
  model?: ModelOptions;
};

export const InitialNoteState: NoteState = {
  title: "New Note",
  prompt: undefined,
  photos: [],
  model: undefined,
};

export type NoteActions = {
  update: (updater: (current: NoteState) => NoteState) => void;
};

export type NoteMeta = {
  titleRef?: React.RefObject<TextInput | null>;
  promptRef?: React.RefObject<TextInput | null>;
};

export type NoteFormProps = {
  state: NoteState;
  actions: NoteActions;
  meta: NoteMeta;
};
function TitleInput() {
  const [hasFocused, setHasFocused] = useState(false);
  const {
    state: { title },
    actions: { update },
    meta: { titleRef, promptRef },
  } = useNoteForm();
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused) {
        setHasFocused(true);
        titleRef?.current?.focus();
      }
    }, [hasFocused, titleRef]),
  );

  return (
    <ThemedTextInput
      ref={titleRef}
      style={{ fontSize: theme.fontSize24, fontWeight: "600" }}
      value={title}
      submitBehavior="blurAndSubmit"
      onChangeText={(text) => {
        update((current) => ({ ...current, title: text }));
      }}
    />
  );
}

function PromptInput() {
  const {
    state: { prompt, model },
    actions: { update },
    meta: { promptRef },
  } = useNoteForm();
  const { generateNote, outputText, cancelGeneration, isLoading } =
    useAIModel();

  const borderColor = useThemeColor("border");
  const iconColor = useThemeColor("iconDefault");

  return (
    <View style={{ gap: theme.space8 }}>
      <ThemedText fontSize={theme.fontSize16} fontWeight={600}>
        Prompt:
      </ThemedText>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.space2,
        }}
      >
        <ThemedTextInput
          ref={promptRef}
          style={[styles.promptInput, { borderColor }]}
          value={prompt}
          placeholder="Say something to guide the model..."
          submitBehavior="blurAndSubmit"
          onChangeText={(text) => {
            update((current) => ({ ...current, prompt: text }));
          }}
        />
        {isLoading && (
          <ThemedPressable
            style={{
              backgroundColor: "red",
              padding: 8,
              borderRadius: "100%",
            }}
            onPress={() => {
              cancelGeneration();
            }}
            animated
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <IconSymbol name="stop" size={theme.fontSize28} color="white" />
          </ThemedPressable>
        )}
        {!isLoading && (
          <ThemedPressable
            style={{
              backgroundColor: iconColor,
              padding: 8,
              borderRadius: "100%",
            }}
            onPress={() => {
              generateNote(model ?? "apple", prompt ?? "alooo");
            }}
            animated
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
          >
            <IconSymbol name="play" size={theme.fontSize28} color="white" />
          </ThemedPressable>
        )}
      </View>
      <ThemedText fontSize={theme.fontSize14}>{outputText}</ThemedText>
    </View>
  );
}

function Header() {
  const {
    state: { photos },
    actions: { update },
  } = useNoteForm();

  const handlePhotoAdded = (assets: Asset[]) => {
    const toAdd = [...photos, ...assets];
    const start = Math.max(toAdd.length - MAX_PHOTOS, 0);
    const end = start + MAX_PHOTOS;

    update((current) => ({
      ...current,
      photos: [...toAdd.slice(start, end)],
    }));
  };

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
  const {
    state: { photos },
    actions: { update },
  } = useNoteForm();

  const handlePhotoRemoved = (asset: Asset) => {
    update((current) => ({
      ...current,
      photos: current.photos.filter((photo) => photo.uri !== asset.uri),
    }));
  };

  return <Carousel photos={photos} onPhotoRemoved={handlePhotoRemoved} />;
}

export default function AddNoteForm() {
  const [state, setState] = useState<NoteState>(InitialNoteState);
  const backgroundColor = useThemeColor("background");

  const titleRef = useRef<TextInput>(null);
  const promptRef = useRef<TextInput>(null);

  return (
    <NoteFormContext.Provider
      value={{
        state,
        actions: { update: setState },
        meta: { titleRef, promptRef },
      }}
    >
      <KeyboardAwareScrollView
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
  promptInput: {
    fontSize: theme.fontSize18,
    flex: 1,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: theme.borderRadius10,
    paddingHorizontal: theme.space8,
    paddingVertical: theme.space12,
  },
});
