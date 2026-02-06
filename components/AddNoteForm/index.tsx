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
import {
  useInitModelCatalog,
  useModelCatalogActions,
  useModelDownloadProgress,
} from "@/hooks/use-model-catalog";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteFormStore } from "@/store/note-form-store";
import { Asset, MAX_PHOTOS } from "@/types/asset";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Markdown from "react-native-markdown-display";
import Carousel from "../Carousel";
import { IconSymbol } from "../ui/icon-symbol";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

type TextInputRef = RefObject<TextInput | null>;

type TitleInputProps = {
  titleRef: TextInputRef;
};

function TitleInput({ titleRef }: TitleInputProps) {
  const [hasFocused, setHasFocused] = useState(false);
  const title = useNoteFormStore((state) => state.title);
  const setTitle = useNoteFormStore((state) => state.setTitle);

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
      onChangeText={setTitle}
    />
  );
}

type PromptInputProps = {
  promptRef: TextInputRef;
};

function PromptInput({ promptRef }: PromptInputProps) {
  const prompt = useNoteFormStore((state) => state.prompt);
  const model = useNoteFormStore((state) => state.model);
  const photos = useNoteFormStore((state) => state.photos);
  const setPrompt = useNoteFormStore((state) => state.setPrompt);
  useInitModelCatalog();

  const {
    isGenerating,
    outputText,
    outputStreamText,
    activeModelKey,
    activeModelLabel,
    cancelGeneration,
    generateNote,
  } = useAIModel();
  const { downloadProgress, isDownloading } =
    useModelDownloadProgress(activeModelKey);
  const { removeAllDownloaded } = useModelCatalogActions();
  const { height } = useWindowDimensions();
  const bottomModalRef = useRef<BottomSheetModal | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const borderColor = useThemeColor("border");
  const iconColor = useThemeColor("iconDefault");
  const shouldShowDownloadProgress = isGenerating && isDownloading;

  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  return (
    <View>
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
          onChangeText={setPrompt}
        />
        <Modal.Provider bottomModalRef={bottomModalRef}>
          <Modal.Trigger
            onPress={() => {
              if (outputStreamText) {
                return;
              }
              generateNote(model, prompt ?? "", photos);
            }}
          >
            <View
              style={{
                backgroundColor: iconColor,
                padding: 8,
                borderRadius: "100%",
              }}
            >
              <IconSymbol name="play" size={theme.fontSize28} color="white" />
            </View>
          </Modal.Trigger>
          <Modal.Content disableDismiss={isGenerating}>
            <View
              style={{
                height: height * 0.6,
                gap: theme.space12,
                marginBottom: theme.space16,
                paddingHorizontal: theme.space24,
              }}
            >
              <ThemedText
                fontSize={theme.fontSize28}
                fontWeight="bold"
                fontFamily="mono"
              >
                Preview
              </ThemedText>
              {shouldShowDownloadProgress && (
                <ProgressBar
                  progress={downloadProgress}
                  text={`Downloading ${activeModelLabel ?? "model"}...`}
                />
              )}
              <ScrollView
                style={{ flex: 1 }}
                ref={scrollViewRef}
                scrollEnabled={!isGenerating}
                onContentSizeChange={() => {
                  if (!isGenerating) {
                    return;
                  }
                  if (scrollDebounceRef.current) {
                    clearTimeout(scrollDebounceRef.current);
                  }
                  scrollDebounceRef.current = setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 120);
                }}
              >
                {isGenerating ? (
                  <ThemedText style={styles.streamPreviewText}>
                    {outputStreamText}
                  </ThemedText>
                ) : (
                  <Markdown style={markdownStyles}>{outputText}</Markdown>
                )}
              </ScrollView>
              <ThemedPressable
                style={{
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isGenerating ? "red" : iconColor,
                  paddingVertical: theme.space12,
                  borderRadius: theme.borderRadius10,
                }}
                onPress={() => {
                  if (!isGenerating) {
                    generateNote(model, prompt ?? "", photos);
                    return;
                  }

                  cancelGeneration();
                  bottomModalRef.current?.dismiss();
                }}
              >
                <ThemedText fontSize={theme.fontSize16} fontWeight={600}>
                  {isGenerating ? "Stop Generation" : "Restart Generation"}
                </ThemedText>
              </ThemedPressable>
            </View>
          </Modal.Content>
        </Modal.Provider>
      </View>
      {
        // TODO: remove this button when testing is done
      }
      <Button
        onPress={() => {
          void removeAllDownloaded();
        }}
        title="Remove all models"
      />
    </View>
  );
}

type HeaderProps = {
  titleRef: TextInputRef;
};

function Header({ titleRef }: HeaderProps) {
  const photos = useNoteFormStore((state) => state.photos);
  const setPhotos = useNoteFormStore((state) => state.setPhotos);

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
      <TitleInput titleRef={titleRef} />
      <ThemedView style={styles.buttonsContainer}>
        <SelectModel />
        <AddPhoto onPhotoAdded={handlePhotoAdded} />
      </ThemedView>
    </ThemedView>
  );
}

function FormCarousel() {
  const photos = useNoteFormStore((state) => state.photos);
  const setPhotos = useNoteFormStore((state) => state.setPhotos);

  const handlePhotoRemoved = useCallback(
    (asset: Asset) => {
      setPhotos(photos.filter((photo) => photo.uri !== asset.uri));
    },
    [photos, setPhotos],
  );

  return <Carousel photos={photos} onPhotoRemoved={handlePhotoRemoved} />;
}

export default function AddNoteForm() {
  const backgroundColor = useThemeColor("background");
  const titleRef = useRef<TextInput>(null);
  const promptRef = useRef<TextInput>(null);

  return (
    <KeyboardAwareScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor }}
      disableScrollOnKeyboardHide
      keyboardDismissMode="on-drag"
      bottomOffset={20}
    >
      <ThemedView style={styles.container}>
        <Header titleRef={titleRef} />
        <FormCarousel />
        <PromptInput promptRef={promptRef} />
      </ThemedView>
    </KeyboardAwareScrollView>
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
  streamPreviewText: {
    fontSize: theme.fontSize16,
    lineHeight: 24,
  },
});

// TODO: adjust markdown styles to theme
const markdownStyles = StyleSheet.create({
  text: { color: "#fff" },
});
