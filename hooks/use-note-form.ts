import { NoteFormProps } from "@/components/AddNoteForm";
import { createContext, use } from "react";

type NoteFormContextProps = {} & NoteFormProps;

export const NoteFormContext = createContext<NoteFormContextProps | null>(null);

export function useNoteForm() {
  const context = use(NoteFormContext);

  if (!context) {
    throw new Error("useNoteForm must be used within a <NoteForm />");
  }

  return context;
}
