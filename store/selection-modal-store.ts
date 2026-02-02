import { IconSymbol } from "@/components/ui/icon-symbol";
import { Href } from "expo-router";
import { ComponentProps } from "react";
import { create } from "zustand";

type IconName = ComponentProps<typeof IconSymbol>["name"];

export type SelectionModalOption = {
  label: string;
  value: string;
  icon?: IconName;
};

export type SelectionModalState = {
  title: string;
  options: SelectionModalOption[];
  dismissTo?: Href;
  paramName: string;
};

type SelectionModalAction = {
  setTitle: (firstName: SelectionModalState["title"]) => void;
  setOptions: (lastName: SelectionModalState["options"]) => void;
  setDismissTo: (dismissTo: SelectionModalState["dismissTo"]) => void;
  setParamName: (paramName: SelectionModalState["paramName"]) => void;
};

export const useSelectionModalStore = create<
  SelectionModalState & SelectionModalAction
>((set) => ({
  title: "Select an Option",
  options: [] as SelectionModalOption[],
  paramName: "query",
  setTitle: (newTitle: string) => set({ title: newTitle }),
  setOptions: (newOptions: SelectionModalOption[]) =>
    set({ options: newOptions }),
  setDismissTo: (dismissTo?: Href) => set({ dismissTo }),
  setParamName: (paramName: string) => set({ paramName }),
}));
