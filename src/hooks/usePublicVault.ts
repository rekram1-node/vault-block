import { type JSONContent } from "novel";
import { create } from "zustand";
import {
  Base64ToUint8Array,
  deriveStretchedMasterKey,
} from "~/lib/encryption/encryption";

interface Vault {
  name: string | undefined;
  encryptedContent: JSONContent | undefined;
  iv: string;
  hdkfSalt: string;
  masterKey: Uint8Array | undefined;
  masterPasswordHash: Uint8Array | undefined;
}

interface VaultState extends Omit<Vault, "iv" | "hdkfSalt"> {
  iv: Uint8Array | undefined;
  hdkfSalt: Uint8Array | undefined;
  stretchedMasterKey: Uint8Array | undefined;
  setKeys: (masterKey: Uint8Array, masterPasswordHash: Uint8Array) => void;
  setData: (
    name: string,
    encryptedContent: JSONContent,
    iv: string,
    hdkfSalt: string,
  ) => Promise<void>;
  clear: () => void;
}

export const usePublicVault = create<VaultState>((set, get) => ({
  name: undefined,
  encryptedContent: undefined,
  iv: undefined,
  hdkfSalt: undefined,
  masterKey: undefined,
  masterPasswordHash: undefined,
  stretchedMasterKey: undefined,

  setKeys: (masterKey, masterPasswordHash) => {
    set({
      masterKey,
      masterPasswordHash,
    });
  },

  setData: async (
    name: string,
    encryptedContent: JSONContent,
    iv: string,
    hdkfSalt: string,
  ) => {
    const stretchedMasterKey = await deriveStretchedMasterKey(
      get().masterKey!,
      Base64ToUint8Array(hdkfSalt),
    );
    set({
      name,
      encryptedContent,
      iv: Base64ToUint8Array(iv),
      hdkfSalt: Base64ToUint8Array(hdkfSalt),
      stretchedMasterKey,
    });
  },

  clear: () => {
    set({
      name: undefined,
      encryptedContent: undefined,
      iv: undefined,
      hdkfSalt: undefined,
      masterKey: undefined,
      masterPasswordHash: undefined,
      stretchedMasterKey: undefined,
    });
  },
}));
