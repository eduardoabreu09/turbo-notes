import { apple } from "@react-native-ai/apple";
import { useMemo } from "react";
import * as ContextMenu from "../ui/ContextMenu";
import BaseSelectModel from "./base";

export default function SelectModel() {
  const menuOptions: ContextMenu.ContextMenuItem[] = useMemo(() => {
    let results: ContextMenu.ContextMenuItem[] = [];
    if (apple.isAvailable()) {
      results.push({
        icon: "apple.intelligence",
        label: "Apple Intelligence",
        value: "apple",
      });
    }
    results.push({
      icon: "brain",
      label: "LLaMA Model",
      value: "llama",
    });
    return results;
  }, []);

  return <BaseSelectModel menuOptions={menuOptions} />;
}
