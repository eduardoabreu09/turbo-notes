import { Asset, MAX_PHOTOS, PHOTO_QUALITY } from "@/types/asset";
import { toAsset } from "@/utils/assets-map";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";
import { Alert, Linking } from "react-native";
import * as ContextMenu from "./ui/ContextMenu";
import { ContextMenuItem } from "./ui/ContextMenu";
import Modal from "./ui/Modal";

export type AddPhotoProps = {
  onPhotoAdded?: (assets: Asset[]) => void;
};

const menuOptions: ContextMenuItem[] = [
  {
    icon: "camera",
    label: "Take Photo",
    value: "camera",
  },
  {
    icon: "camera.viewfinder",
    label: "From Gallery",
    value: "gallery",
  },
];

export default function AddPhoto({ onPhotoAdded }: AddPhotoProps) {
  const bottomModalRef = useRef<BottomSheetModal | null>(null);

  const promptToOpenSettings = (message: string) => {
    Alert.alert("Permission required", message, [
      { text: "Open Settings", onPress: () => Linking.openSettings() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const ensurePermission = async (
    requestPermission: () => Promise<ImagePicker.PermissionResponse>,
    message: string,
  ) => {
    const permissionResult = await requestPermission();

    if (!permissionResult.granted) {
      promptToOpenSettings(message);
      return false;
    }

    return true;
  };

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }
    console.log(result.assets);
    onPhotoAdded?.(toAsset(result.assets));
    bottomModalRef.current?.dismiss();
  };

  const pickImageFromLibrary = async () => {
    const hasPermission = await ensurePermission(
      ImagePicker.requestMediaLibraryPermissionsAsync,
      "Permission to access the media library is required.",
    );

    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS,
        quality: PHOTO_QUALITY,
        // base64: true,
      });
      handleResult(result);
    } catch (error) {
      console.error("Error picking image from library:", error);
    }
  };

  const takeImage = async () => {
    const hasPermission = await ensurePermission(
      ImagePicker.requestCameraPermissionsAsync,
      "Permission to access the camera is required.",
    );

    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS,
        quality: PHOTO_QUALITY,
        // base64: true,
      });
      handleResult(result);
    } catch (error) {
      console.error("Error taking image with camera:", error);
    }
  };

  const handleSelect = (item: ContextMenu.ContextMenuItem) => {
    if (item.value === "camera") {
      takeImage();
    } else if (item.value === "gallery") {
      pickImageFromLibrary();
    } else throw new Error("Unsupported option selected");
  };

  return (
    <Modal.Provider bottomModalRef={bottomModalRef}>
      <Modal.Trigger>
        <Modal.TriggerTitle title="Add Photo" />
        <Modal.Content>
          <Modal.Selection options={menuOptions} onSelect={handleSelect} />
        </Modal.Content>
      </Modal.Trigger>
    </Modal.Provider>
  );
}
