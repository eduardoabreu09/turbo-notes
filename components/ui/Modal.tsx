import { theme } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import {
  ComponentProps,
  createContext,
  use,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Modal as ModalRN, StyleSheet, View } from "react-native";
import { ThemedPressable, ThemedText } from "../Themed";
import { IconSymbol } from "./icon-symbol";

import { SelectionModalOption } from "@/store/selection-modal-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type IconName = ComponentProps<typeof IconSymbol>["name"];

type ModalState = {
  open: boolean;
};

type ModalActions = {
  update: (updater: (current: ModalState) => ModalState) => void;
};

type ModalMeta = {
  bottomModalRef?: React.RefObject<BottomSheetModal | null>;
};

type ModalContextValue = {
  state: ModalState;
  actions: ModalActions;
  meta: ModalMeta;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

const useModalContext = () => {
  const context = use(ModalContext);
  if (!context) {
    throw new Error("Modal components must be used within Modal.Provider");
  }
  return context;
};

type ModalProps = {
  children: ReactNode;
  bottomModalRef?: React.RefObject<BottomSheetModal | null>;
};

const Modal = ({ children, bottomModalRef }: ModalProps) => {
  const [state, setState] = useState<ModalState>({ open: false });

  return (
    <ModalContext.Provider
      value={{ state, actions: { update: setState }, meta: { bottomModalRef } }}
    >
      {children}
    </ModalContext.Provider>
  );
};

type TriggerProps = {
  children: ReactNode;
};

function Trigger({ children }: TriggerProps) {
  const {
    state,
    actions: { update },
  } = useModalContext();

  const handlePress = () => {
    update((current) => ({ ...current, open: !state.open }));
    Haptics.selectionAsync();
  };

  return (
    <ThemedPressable style={styles.titleContainer} onPress={handlePress}>
      {children}
    </ThemedPressable>
  );
}

type TriggerTitleProps = {
  title?: string;
  icon?: IconName;
};

function TriggerTitle({
  title = "Select an Option",
  icon = "plus",
}: TriggerTitleProps) {
  const iconColor = useThemeColor("iconDefault");
  return (
    <>
      <IconSymbol name={icon} size={20} color={iconColor} />
      <ThemedText fontSize={theme.fontSize20}>{title}</ThemedText>
    </>
  );
}

type ModalContentProps = {
  children: ReactNode;
};

function ModalContent({ children }: ModalContentProps) {
  const {
    state,
    actions: { update },
    meta: { bottomModalRef },
  } = useModalContext();

  const backgroundColor = useThemeColor("backgroundSecondary");
  const handleColor = useThemeColor("activeContent");

  useEffect(() => {
    if (state.open) {
      bottomModalRef?.current?.present();
      return;
    }
  });

  const handleDismiss = () => {
    bottomModalRef?.current?.dismiss();
  };

  return (
    <ModalRN visible={state.open} transparent animationType="none">
      <GestureHandlerRootView style={styles.container}>
        <ThemedPressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
          onPress={() => {
            handleDismiss();
          }}
        ></ThemedPressable>
        <BottomSheetModalProvider>
          <BottomSheetModal
            backgroundStyle={{ backgroundColor }}
            handleIndicatorStyle={{ backgroundColor: handleColor }}
            ref={bottomModalRef}
            animationConfigs={{ duration: 150 }}
            onDismiss={() => {
              update((current) => ({ ...current, open: false }));
            }}
            style={{ marginHorizontal: theme.space16 }}
            // add bottom inset to elevate the sheet
            bottomInset={theme.space24}
            // set `detached` to true
            detached={true}
          >
            <BottomSheetView style={styles.contentContainer}>
              {children}
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ModalRN>
  );
}

type ModalSelectionProps = {
  options: SelectionModalOption[];
  onSelect?: (item: SelectionModalOption) => void;
  height?: number;
};

function Selection({ options, onSelect, height = 200 }: ModalSelectionProps) {
  const iconColor = useThemeColor("iconDefault");
  const backgroundColor = useThemeColor("backgroundSecondary");

  const handleSelect = (option: SelectionModalOption) => {
    onSelect?.(option);
    Haptics.selectionAsync();
  };
  return (
    <>
      <View
        style={{
          height,
          gap: theme.space8,
          paddingHorizontal: theme.space24,
        }}
      >
        {options.map((option) => (
          <ThemedPressable
            backgroundColor={backgroundColor}
            key={option.label}
            onPress={() => handleSelect(option)}
            style={styles.titleContainer}
          >
            {option.icon && (
              <IconSymbol
                name={option.icon}
                size={theme.fontSize24}
                color={iconColor}
              />
            )}
            <ThemedText fontSize={theme.fontSize18}>{option.label}</ThemedText>
          </ThemedPressable>
        ))}
      </View>
    </>
  );
}

Modal.Provider = Modal;
Modal.Trigger = Trigger;
Modal.TriggerTitle = TriggerTitle;
Modal.Content = ModalContent;
Modal.Selection = Selection;

export default Modal;

const styles = StyleSheet.create({
  titleContainer: {
    paddingVertical: theme.space12,
    alignItems: "center",
    flexDirection: "row",
    gap: theme.space8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
  },
});
