import { useNoteForm } from "@/hooks/use-note-form";
import { SelectionModalOption } from "@/store/selection-modal-store";
import { ModelOptions } from "@/types/model";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import Modal from "../ui/Modal";

export type SelectModelProps = {
  menuOptions: SelectionModalOption[];
};

export default function BaseSelectModel({ menuOptions }: SelectModelProps) {
  const {
    state: { model },
    actions: { update },
  } = useNoteForm();
  const bottomModalRef = useRef<BottomSheetModal | null>(null);

  useEffect(() => {
    if (!model) {
      update((current) => ({
        ...current,
        model: menuOptions[0].value as ModelOptions,
      }));
    }
  });

  const selectedOption = useMemo(() => {
    if (!model) {
      return menuOptions[0];
    }
    const find = menuOptions.find((option) => option.value === model);
    return find || menuOptions[0];
  }, [menuOptions, model]);

  const handleSelect = (option: SelectionModalOption) => {
    update((current) => ({
      ...current,
      model: option.value as ModelOptions,
    }));
    bottomModalRef.current?.dismiss();
  };

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
