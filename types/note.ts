import { Asset } from "./asset";

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  photos?: Asset[];
  emoji?: string;
};

export type AddNote = {
  title: string;
  content: string;
  photos?: Asset[];
  emoji?: string;
};
