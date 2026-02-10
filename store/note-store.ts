import { AddNote, Note } from "@/types/note";
import { create } from "zustand";

export type NoteState = {
  notes: Map<string, Note>;
};

export const initialNoteState: NoteState = {
  notes: new Map<string, Note>(),
};

type NoteStore = NoteState & {
  addNote: (note: AddNote) => void;
  getNoteById: (id: string) => Note | undefined;
  updateNote: (id: string, updatedFields: Omit<Note, "id">) => boolean;
  removeNote: (note: Note) => boolean;
  removeNoteById: (id: string) => boolean;
  removeAllNotes: () => void;
};

export const useNoteStore = create<NoteStore>((set, get) => ({
  ...initialNoteState,
  addNote: (noteToAdd) => {
    const now = new Date();
    const newNote: Note = {
      ...noteToAdd,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    // TODO Make sure copying the map is needed
    const map = get().notes;
    set({ notes: map.set(newNote.id, newNote) });
  },
  getNoteById: (id) => get().notes.get(id),
  updateNote: (id, updatedFields) => {
    const map = get().notes;
    const existingNote = map.get(id);
    if (!existingNote) return false;
    const updatedNote = {
      ...existingNote,
      ...updatedFields,
      updatedAt: new Date(),
    };
    //
    set({ notes: map.set(id, updatedNote) });
    return true;
  },
  removeNote: (note) => {
    const map = get().notes;
    const result = map.delete(note.id);
    if (result) {
      set({ notes: map });
      return true;
    }
    return false;
  },
  removeNoteById: (id) => {
    const map = get().notes;
    const result = map.delete(id);
    if (result) {
      set({ notes: map });
      return true;
    }
    return false;
  },
  removeAllNotes: () => set(initialNoteState),
}));
