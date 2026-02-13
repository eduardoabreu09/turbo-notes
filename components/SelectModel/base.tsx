import { useNoteForm } from "@/store/note-form-store";
import { SelectionModalOption } from "@/types/selection";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import Modal from "../ui/Modal";

export type SelectModelProps = {
  menuOptions: SelectionModalOption[];
};

export default function BaseSelectModel({ menuOptions }: SelectModelProps) {
  const { model, setModel } = useNoteForm(
    useShallow((state) => ({
      model: state.model,
      setModel: state.setModel,
    })),
  );
  const bottomModalRef = useRef<BottomSheetModal | null>(null);

  useEffect(() => {
    if (!model && menuOptions[0]) {
      setModel(menuOptions[0].value);
      return;
    }

    const hasSelectedOption = menuOptions.some(
      (option) => option.value === model,
    );
    if (model && !hasSelectedOption && menuOptions[0]) {
      setModel(menuOptions[0].value);
    }
  }, [menuOptions, model, setModel]);

  const selectedOption = useMemo(() => {
    if (!model) {
      return menuOptions[0];
    }
    const find = menuOptions.find((option) => option.value === model);
    return find || menuOptions[0];
  }, [menuOptions, model]);

  const handleSelect = (option: SelectionModalOption) => {
    setModel(option.value);
    bottomModalRef.current?.dismiss();
  };

  if (!menuOptions[0]) {
    return null;
  }

  return (
    <Modal.Provider bottomModalRef={bottomModalRef}>
      <Modal.Trigger>
        <Modal.TriggerTitle
          title={selectedOption.label}
          icon={selectedOption.icon}
        />
        <Modal.Content>
          <Modal.Selection options={menuOptions} onSelect={handleSelect} />
        </Modal.Content>
      </Modal.Trigger>
    </Modal.Provider>
  );
}
