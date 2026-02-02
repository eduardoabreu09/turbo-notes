import { SelectionModalOption } from "@/store/selection-modal-store";
import { apple } from "@react-native-ai/apple";
import { useMemo } from "react";
import BaseSelectModel from "./base";

export default function SelectModel() {
  const menuOptions = useMemo(() => {
    let results: SelectionModalOption[] = [];
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
