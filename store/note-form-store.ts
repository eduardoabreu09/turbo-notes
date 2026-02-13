import { Asset } from "@/types/asset";
import { createStore, useStore } from "zustand";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { createContext, createRef, useContext } from "react";
import { TextInput } from "react-native";

type State = {
  title: string;
  prompt?: string;
  photos: Asset[];
  model?: string;
};

const initialState: State = {
  title: "New Note",
  prompt: undefined,
  photos: [],
  model: undefined,
};

type Actions = {
  setTitle: (title: string) => void;
  setPrompt: (prompt?: string) => void;
  setPhotos: (photos: Asset[]) => void;
  setModel: (model?: string) => void;
  reset: () => void;
};

type Meta = {
  titleRef: React.RefObject<TextInput | null>;
  promptRef: React.RefObject<TextInput | null>;
  bottomModalRef: React.RefObject<BottomSheetModal | null>;
};

type NoteFormStore = State & Actions & Meta;

type Store = ReturnType<typeof createNoteFormStore>;

export const createNoteFormStore = (initProps?: Partial<State>) => {
  const DEFAULT_PROPS: State = initialState;
  return createStore<NoteFormStore>()((set) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    titleRef: createRef<TextInput>(),
    promptRef: createRef<TextInput>(),
    bottomModalRef: createRef<BottomSheetModal>(),
    setTitle: (title) => set({ title }),
    setPrompt: (prompt) => set({ prompt }),
    setPhotos: (photos) => set({ photos }),
    setModel: (model) => set({ model }),
    reset: () => set({ ...initialState }),
  }));
};

export const NoteFormContext = createContext<Store | null>(null);

export function useNoteForm<T>(selector: (state: NoteFormStore) => T): T {
  const store = useContext(NoteFormContext);
  if (!store) throw new Error("Missing NoteForm.Provider in the tree");
  return useStore(store, selector);
}
