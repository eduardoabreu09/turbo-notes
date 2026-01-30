export const MAX_PHOTOS = 3;
export const PHOTO_QUALITY = 0.7;

export type Asset = {
  uri: string;
  assetId?: string | null;
  width: number;
  height: number;
  fileName?: string | null;
  fileSize?: number;
  mimeType?: string;
  base64?: string | null;
};
