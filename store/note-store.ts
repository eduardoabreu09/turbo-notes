import { AddNote, Note } from "@/types/note";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createMMKVStorage } from "./mmkv";

export type NoteState = {
  notes: Record<string, Note>;
};

export const initialNoteState: NoteState = {
  notes: {},
};

type NoteStore = NoteState & {
  addNote: (note: AddNote) => void;
  getNoteById: (id: string) => Note | undefined;
  updateNote: (id: string, updatedFields: Omit<Note, "id">) => boolean;
  removeNote: (note: Note) => boolean;
  removeNoteById: (id: string) => boolean;
  removeAllNotes: () => void;
};

type PersistedNoteStoreState = Pick<NoteState, "notes">;

function normalizeDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function normalizePersistedNote(value: unknown): Note | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const note = value as Partial<Note>;
  if (
    typeof note.id !== "string" ||
    typeof note.title !== "string" ||
    typeof note.modelId !== "string" ||
    typeof note.content !== "string"
  ) {
    return undefined;
  }

  return {
    id: note.id,
    title: note.title,
    modelId: note.modelId,
    content: note.content,
    createdAt: normalizeDate(note.createdAt),
    updatedAt: normalizeDate(note.updatedAt),
    prompt: typeof note.prompt === "string" ? note.prompt : undefined,
    photos: Array.isArray(note.photos) ? note.photos : undefined,
    emoji: typeof note.emoji === "string" ? note.emoji : undefined,
  };
}

function normalizePersistedNotes(value: unknown): Record<string, Note> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.values(value as Record<string, unknown>).reduce<
    Record<string, Note>
  >((acc, note) => {
    const normalized = normalizePersistedNote(note);
    if (normalized) {
      acc[normalized.id] = normalized;
    }
    return acc;
  }, {});
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      ...initialNoteState,
      addNote: (noteToAdd) => {
        const now = new Date();
        const newNote: Note = {
          ...noteToAdd,
          id: Crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        const map = { ...get().notes };
        map[newNote.id] = newNote;
        set({ notes: map });
      },
      getNoteById: (id) => get().notes[id],
      updateNote: (id, updatedFields) => {
        const map = { ...get().notes };
        const existingNote = map[id];

        if (!existingNote) return false;
        const updatedNote = {
          ...existingNote,
          ...updatedFields,
          updatedAt: new Date(),
        };

        map[id] = updatedNote;
        set({ notes: map });
        return true;
      },
      removeNote: (note) => {
        const map = { ...get().notes };

        if (note.id in map) {
          delete map[note.id];
          set({ notes: map });
          return true;
        }
        return false;
      },
      removeNoteById: (id) => {
        const map = { ...get().notes };

        if (id in map) {
          delete map[id];
          set({ notes: map });
          return true;
        }
        return false;
      },
      removeAllNotes: () => set({ notes: {} }),
    }),
    {
      name: "note-storage",
      version: 1,
      storage: createJSONStorage(() =>
        createMMKVStorage({ id: "note-storage" }),
      ),
      partialize: (state): PersistedNoteStoreState => ({
        notes: state.notes,
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<PersistedNoteStoreState>;
        return {
          notes: normalizePersistedNotes(state?.notes),
        };
      },
      merge: (persistedState, currentState) => {
        const typed = persistedState as Partial<PersistedNoteStoreState>;
        return {
          ...currentState,
          notes: normalizePersistedNotes(typed?.notes),
        };
      },
    },
  ),
);
