import { Asset } from "@/types/asset";
import { ImagePickerAsset } from "expo-image-picker";

export function toAsset(assets: ImagePickerAsset[]): Asset[] {
  return assets.map(
    ({
      uri,
      assetId,
      width,
      height,
      fileName,
      fileSize,
      mimeType,
      base64,
    }) => ({
      uri,
      assetId,
      width,
      height,
      fileName,
      fileSize,
      mimeType,
      base64,
    }),
  );
}
