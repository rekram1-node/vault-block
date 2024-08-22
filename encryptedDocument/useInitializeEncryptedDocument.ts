import { useState, useCallback } from "react";
import {
  createSalt,
  encryptData,
  deriveDocumentKey,
  hashPassword,
} from "~/encryption/encryption";
import { api } from "~/utils/api";
import { useSnackbar } from "notistack";
import { defaultValue } from "~/components/novel/Editor";
import { type DocumentData } from "~/types/DocumentData";

export const useInitializeEncryptedDocument = (
  id: string,
  onCreation: (data: DocumentData, key: Buffer) => void,
) => {
  const { enqueueSnackbar } = useSnackbar();
  const utils = api.useUtils();
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState<Buffer>();

  const { mutate: initializePageMutation, isLoading: isInitializePageLoading } =
    api.encryptedDocuments.initialize.useMutation({
      onSuccess: (data) => {
        void utils.encryptedDocuments.getBase.invalidate();
        onCreation(data, key!);
        enqueueSnackbar("Successfully initialized!", {
          autoHideDuration: 3000,
          variant: "success",
        });
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          enqueueSnackbar(errorMessage[0], {
            autoHideDuration: 3000,
            variant: "error",
          });
        } else {
          enqueueSnackbar(
            "Failed to initialize protected page! Please try again later.",
            {
              autoHideDuration: 3000,
              variant: "error",
            },
          );
        }
      },
    });

  const mutate = useCallback(
    async (password: string) => {
      setLoading(true);
      try {
        const documentSalt = createSalt();
        const iv = createSalt();
        const documentKey = await deriveDocumentKey(password, documentSalt);
        const encryptedData = await encryptData(
          JSON.stringify(defaultValue),
          iv,
          documentKey,
        );
        const passwordSalt = createSalt();
        const passwordHash = await hashPassword(password, passwordSalt);
        setKey(documentKey);
        initializePageMutation({
          id,
          encryptedContent: encryptedData,
          passwordHash: passwordHash,
          passwordSalt: passwordSalt.toString("base64"),
          iv: iv.toString("base64"),
          documentSalt: documentSalt.toString("base64"),
        });
      } catch (e: unknown) {
        enqueueSnackbar("Failed to hash password: " + String(e), {
          autoHideDuration: 3000,
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [initializePageMutation, id, enqueueSnackbar],
  );
  const isLoading = loading || isInitializePageLoading;

  return { mutate, isLoading };
};
