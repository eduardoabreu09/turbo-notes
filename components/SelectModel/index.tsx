import { SelectionModalOption } from "@/store/selection-modal-store";
import BaseSelectModel from "./base";

export default function SelectModel() {
  const menuOptions: SelectionModalOption[] = [
    {
      icon: "brain",
      label: "LLaMA Model",
      value: "llama",
    },
  ];

  return <BaseSelectModel menuOptions={menuOptions} />;
}
