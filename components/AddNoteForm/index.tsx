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
import { ModelOptions } from "@/types/model";
import { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TextInput } from "react-native";

export type NoteState = {
  title: string;
  prompt?: string;
  photos: string[];
  model?: ModelOptions;
};

export const InitialNoteState: NoteState = {
  title: "New Note",
  prompt: undefined,
  photos: [],
  model: undefined,
};

export type NoteFormProps = {
  state: NoteState;
  actions: {
    update: (updater: (current: NoteState) => NoteState) => void;
  };
  meta: {
    titleRef?: React.RefObject<TextInput | null>;
    promptRef?: React.RefObject<TextInput | null>;
  };
};

function TitleInput() {
  const {
    state: { title },
    actions: { update },
    meta: { titleRef },
  } = useNoteForm();

  return (
    <ThemedTextInput
      ref={titleRef}
      style={{ fontSize: theme.fontSize24, fontWeight: "600" }}
      value={title}
      onChangeText={(text) => {
        update((current) => ({ ...current, title: text }));
      }}
    />
  );
}

function PromptInput() {
  const {
    state: { prompt },
    actions: { update },
    meta: { promptRef },
  } = useNoteForm();

  const borderColor = useThemeColor("border");

  return (
    <ThemedTextInput
      ref={promptRef}
      multiline
      numberOfLines={3}
      style={{
        fontSize: theme.fontSize24,
        fontWeight: "600",
        borderColor,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
      }}
      value={prompt}
      onChangeText={(text) => {
        update((current) => ({ ...current, prompt: text }));
      }}
    />
  );
}

function Header() {
  return (
    <ThemedView style={styles.headerContainer}>
      <TitleInput />
      <ThemedView style={styles.buttonsContainer}>
        <SelectModel />
        <AddPhoto />
      </ThemedView>
    </ThemedView>
  );
}

function GenerateNoteButton() {
  const {
    state: { model, prompt },
  } = useNoteForm();
  const { generateNote, outputText, cancelGeneration } = useAIModel();
  return (
    <>
      <ThemedPressable
        onPress={() => {
          generateNote(model ?? "apple", prompt ?? "alooo");
        }}
      >
        <ThemedText fontSize={theme.fontSize18} fontWeight={600}>
          Send
        </ThemedText>
      </ThemedPressable>
      <ThemedPressable
        onPress={() => {
          cancelGeneration();
        }}
      >
        <ThemedText fontSize={theme.fontSize18} fontWeight={600}>
          Cancel
        </ThemedText>
      </ThemedPressable>
      <ThemedText fontSize={theme.fontSize14}>{outputText}</ThemedText>
    </>
  );
}

export default function AddNoteForm() {
  const [state, setState] = useState<NoteState>(InitialNoteState);
  const backgroundColor = useThemeColor("background");

  const titleRef = useRef<TextInput>(null);
  const promptRef = useRef<TextInput>(null);

  const value = useMemo(
    () => ({
      state,
      actions: { update: setState },
      meta: { titleRef, promptRef },
    }),
    [state, setState, titleRef, promptRef],
  );

  return (
    <NoteFormContext.Provider value={value}>
      <ScrollView style={{ flex: 1, backgroundColor }}>
        <ThemedView style={styles.container}>
          <Header />
          <PromptInput />
          <GenerateNoteButton />
        </ThemedView>
      </ScrollView>
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
