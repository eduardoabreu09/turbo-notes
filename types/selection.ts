import { IconSymbol } from "@/components/ui/icon-symbol";
import { ComponentProps } from "react";

type IconName = ComponentProps<typeof IconSymbol>["name"];

export type SelectionModalOption = {
  label: string;
  value: string;
  icon?: IconName;
};
