import { MMKVLoader } from "react-native-mmkv-storage";
import type { StateStorage } from "zustand/middleware";

export interface MMKVOptions {
  id: string;
  isEncrypted?: boolean;
}

export const createMMKVStorage = (options: MMKVOptions): StateStorage => {
  let instance = null;
  if (options.isEncrypted) {
    instance = new MMKVLoader()
      .withEncryption()
      .withInstanceID(options.id)
      .initialize();
  } else {
    instance = new MMKVLoader().withInstanceID(options.id).initialize();
  }

  return {
    getItem: (name: string) => {
      return instance.getString(name) ?? null;
    },
    setItem: (name: string, value: string) => {
      instance.setString(name, value);
    },
    removeItem: (name: string) => {
      instance.removeItem(name);
    },
  };
};
