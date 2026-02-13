import { Asset } from "./asset";

export type Note = {
  id: string;
  title: string;
  modelId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  prompt?: string;
  photos?: Asset[];
  emoji?: string;
};

export type AddNote = {
  title: string;
  modelId: string;
  content: string;
  prompt?: string;
  photos?: Asset[];
  emoji?: string;
};
