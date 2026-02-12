import { Asset } from "./asset";

export type Note = {
  id: string;
  title: string;
  prompt: string;
  modelId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  photos?: Asset[];
  emoji?: string;
};

export type AddNote = {
  title: string;
  prompt: string;
  modelId: string;
  content: string;
  photos?: Asset[];
  emoji?: string;
};
