import { theme } from "@/constants/theme";
import { useAIModel } from "@/hooks/use-ai-model";
import {
  useModelCatalogActions,
  useModelDownloadProgress,
} from "@/hooks/use-model-catalog";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNoteForm } from "@/store/note-form-store";
import { useNoteStore } from "@/store/note-store";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import CustomMarkdown from "../CustomMarkdown";
import { ThemedPressable, ThemedText, ThemedTextInput } from "../Themed";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";
import { IconSymbol } from "../ui/icon-symbol";

export default function PromptInput() {
  const { prompt, model, photos, title, setPrompt, promptRef, bottomModalRef } =
    useNoteForm(
      useShallow((state) => ({
        prompt: state.prompt,
        model: state.model,
        photos: state.photos,
        title: state.title,
        setPrompt: state.setPrompt,
        promptRef: state.promptRef,
        bottomModalRef: state.bottomModalRef,
      })),
    );

  const {
    isGenerating,
    outputText,
    outputStreamText,
    activeModelKey,
    activeModelLabel,
    generatedModelKey,
    cancelGeneration,
    generateNote,
  } = useAIModel();
  const { downloadProgress, isDownloading } =
    useModelDownloadProgress(activeModelKey);
  const { removeAllDownloaded } = useModelCatalogActions();
  const { height } = useWindowDimensions();
  const addNote = useNoteStore((state) => state.addNote);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const route = useRouter();

  const borderColor = useThemeColor("border");
  const iconColor = useThemeColor("iconDefault");
  const shouldShowDownloadProgress = isGenerating && isDownloading;
  const canSaveGeneratedNote = Boolean(outputText && generatedModelKey);

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
                  <CustomMarkdown value={outputText} />
                )}
              </ScrollView>
              <View
                style={{
                  flexDirection: "row",
                  gap: theme.space12,
                }}
              >
                <ThemedPressable
                  style={{
                    flex: 1,
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
                {!isGenerating && outputText && (
                  <ThemedPressable
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: iconColor,
                      opacity: canSaveGeneratedNote ? 1 : 0.45,
                      paddingVertical: theme.space12,
                      borderRadius: theme.borderRadius10,
                    }}
                    disabled={!canSaveGeneratedNote}
                    onPress={() => {
                      if (!generatedModelKey) {
                        return;
                      }
                      addNote({
                        title,
                        content: outputText,
                        photos,
                        prompt,
                        modelId: generatedModelKey,
                      });
                      bottomModalRef.current?.dismiss();
                      route.dismiss();
                    }}
                  >
                    <ThemedText fontSize={theme.fontSize16} fontWeight={600}>
                      Save Note
                    </ThemedText>
                  </ThemedPressable>
                )}
              </View>
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

const styles = StyleSheet.create({
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
