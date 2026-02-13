import { theme } from "@/constants/theme";
import { useNoteForm } from "@/store/note-form-store";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ThemedTextInput } from "../Themed";

export default function TitleInput() {
  const [hasFocused, setHasFocused] = useState(false);
  const { title, setTitle, titleRef } = useNoteForm(
    useShallow((state) => ({
      title: state.title,
      setTitle: state.setTitle,
      titleRef: state.titleRef,
    })),
  );

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
