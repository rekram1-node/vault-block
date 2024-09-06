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

export function CreateVault() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [confirm, setConfirm] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();

  const $post = api.user.vaults.$post;
  const mutation = useMutation($post)({
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
  const passwordsMatch = password === confirm;

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
    if (!password || !name) return;

    const vaultId = createId();
    const hdkfSalt = createSalt();
    const vaultIv = createSalt(12);
    const masterKey = await deriveMasterKey(password, vaultId);
    const stretchedKey = await deriveStretchedMasterKey(masterKey, hdkfSalt);
    const masterPasswordHash = await deriveMasterPasswordHash(
      password,
      masterKey,
    );
    const encryptedData = await encryptData(
      JSON.stringify(defaultValue),
      vaultIv,
      stretchedKey,
    );

    mutation.mutate({
      json: {
        id: vaultId,
        name,
        encryptedVaultData: encryptedData,
        hdkfSalt: Uint8ArrayToBase64(hdkfSalt),
        vaultIv: Uint8ArrayToBase64(vaultIv),
        passwordHash: Uint8ArrayToBase64(masterPasswordHash),
      },
    });
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
        <Button className="right-4 top-4">New Vault</Button>
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
