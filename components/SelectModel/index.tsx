import { useMemo } from "react";
import * as ContextMenu from "../ui/ContextMenu";
import BaseSelectModel from "./base";

export default function SelectModel() {
  const menuOptions: ContextMenu.ContextMenuItem[] = useMemo(
    () => [
      {
        icon: "brain",
        label: "LLaMA Model",
        value: "llama",
      },
    ],
    [],
  );

  return <BaseSelectModel menuOptions={menuOptions} />;
}
