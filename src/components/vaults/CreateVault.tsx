import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { debounce } from "lodash";
import { toast } from "sonner";

import { useMutation } from "~/hooks/useMutation";
import { api, keys, queryClient } from "~/lib/query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createId } from "shared/lib/createId";
import {
  createSalt,
  deriveMasterKey,
  deriveMasterPasswordHash,
  deriveStretchedMasterKey,
  encryptData,
  Uint8ArrayToBase64,
} from "~/lib/encryption/encryption";
import { defaultValue } from "~/components/novel/Editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useHashingWorker } from "~/hooks/useHashingWorker";
import { CreateVaultButton } from "./CreateVaultButton";

const checkPasswordsMatch = (password: string, confirm: string) => {
  return password === confirm;
};

export function CreateVault({ disabled }: { disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [confirm, setConfirm] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const $post = api.user.vaults.$post;
  const { mutate, isPending } = useMutation($post)({
    mutationKey: keys.vaults,
    mutationFn: async (args) => {
      await $post(args);
      return {};
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: keys.vaults,
      });
      toast.success("Successfully created vault");
      setOpen(false);
      setPassword(undefined);
      setConfirm(undefined);
    },
    onError(error, _variables, _context) {
      toast.error(
        "Failed to create vault, encountered error: " + error.message,
      );
    },
  });

  const validPassword = password?.match(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
  );
  const passwordsMatch = confirm && password === confirm;

  useEffect(() => {
    if (password && !validPassword) {
      setPasswordError(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.",
      );
    } else {
      setPasswordError(undefined);
    }
  }, [password, validPassword]);

  useEffect(() => {
    if (confirm && !passwordsMatch) {
      setConfirmError("Passwords do not match.");
    } else {
      setConfirmError(undefined);
    }
  }, [confirm, passwordsMatch]);

  const onCreate = async () => {
    setIsLoading(true);
    if (!password || !name) return;

    const vaultId = createId();
    const hdkfSalt = createSalt();
    const vaultIv = createSalt(12);

    const { stretchedMasterKey } = await useHashingWorker({
      password,
      vaultId,
      hdkfSalt,
    });
    if (!stretchedMasterKey) {
      toast.error("Failed to hash password");
      return;
    }

    const encryptedData = await encryptData(
      JSON.stringify(defaultValue),
      vaultIv,
      stretchedMasterKey,
    );

    mutate({
      json: {
        id: vaultId,
        name,
        encryptedVaultData: encryptedData,
        hdkfSalt: Uint8ArrayToBase64(hdkfSalt),
        vaultIv: Uint8ArrayToBase64(vaultIv),
        passwordHash: Uint8ArrayToBase64(stretchedMasterKey),
      },
    });
    setIsLoading(false);
  };

  const isDisabled =
    name === undefined ||
    password === undefined ||
    confirm === undefined ||
    !validPassword ||
    !passwordsMatch;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CreateVaultButton disabled={disabled} />
      </DialogTrigger>
      <DialogContent className="md:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create a Vault</DialogTitle>
          <DialogDescription>
            Set the name and password for your Vault here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Vault Name</Label>
            <Input
              id="name"
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              onChange={debounce(
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value),
                600,
              )}
            />
            {passwordError && (
              <p className="text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              required
              onChange={debounce(
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirm(e.target.value),
                600,
              )}
            />
            {confirmError && (
              <p className="text-sm text-red-500">{confirmError}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isDisabled} onClick={onCreate}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
