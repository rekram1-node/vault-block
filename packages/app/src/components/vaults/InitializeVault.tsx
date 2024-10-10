import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

import { useMutation } from "~/hooks/useMutation";
import { oauthApi, keys, queryClient } from "~/lib/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createSalt, Uint8ArrayToBase64 } from "~/lib/encryption/encryption";
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

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
        "Password must include an uppercase letter, a lowercase letter, and a number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Props = {
  vaultId: string;
  open: boolean;
  setOpen: (_: boolean) => void;
};

export function InitializeVault({ vaultId, open, setOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const $init = oauthApi.user.vaults[":vaultId"].initialize.$post;
  const { mutate, isPending } = useMutation($init)({
    mutationKey: keys.vaults,
    mutationFn: async (args) => {
      await $init(args);
      return {};
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: keys.vaults,
      });
      toast.success("Successfully initialized vault");
      setOpen(false);
      form.reset();
    },
    onError(error, _variables, _context) {
      toast.error(
        "Failed to initialize vault, encountered error: " + error.message,
      );
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onInitialize = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const { password } = data;

    const hdkfSalt = createSalt();
    const vaultIv = createSalt(12);

    const { stretchedMasterKey, masterPasswordHash } = await useHashingWorker({
      password,
      vaultId,
      hdkfSalt,
    });
    if (!stretchedMasterKey || !masterPasswordHash) {
      toast.error("Failed to hash password");
      return;
    }

    mutate({
      param: { vaultId },
      json: {
        encryptedVaultData: defaultValue,
        hdkfSalt: Uint8ArrayToBase64(hdkfSalt),
        vaultIv: Uint8ArrayToBase64(vaultIv),
        passwordHash: Uint8ArrayToBase64(masterPasswordHash),
      },
    });
    setIsLoading(false);
  };

  const { watch } = form;

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const isDisabled = !password || !confirmPassword || isPending || isLoading;

  const loadingText = isLoading ? "Hashing Password..." : "Initializing...";

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent className="md:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Initialize Your Vault</DialogTitle>
          <DialogDescription>
            Set password for your Vault here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onInitialize)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isDisabled}
                loading={isPending || isLoading}
                loadingText={loadingText}
              >
                Initialize
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
