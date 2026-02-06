import { Asset } from "@/types/asset";
import { create } from "zustand";

export type NoteState = {
  title: string;
  prompt?: string;
  photos: Asset[];
  model?: string;
};

export const initialNoteState: NoteState = {
  title: "New Note",
  prompt: undefined,
  photos: [],
  model: undefined,
};

type NoteFormStore = NoteState & {
  setTitle: (title: string) => void;
  setPrompt: (prompt?: string) => void;
  setPhotos: (photos: Asset[]) => void;
  setModel: (model?: string) => void;
  reset: () => void;
};

export const useNoteFormStore = create<NoteFormStore>((set) => ({
  ...initialNoteState,
  setTitle: (title) => set({ title }),
  setPrompt: (prompt) => set({ prompt }),
  setPhotos: (photos) => set({ photos }),
  setModel: (model) => set({ model }),
  reset: () => set(initialNoteState),
}));
