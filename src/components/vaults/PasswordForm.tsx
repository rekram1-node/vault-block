import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";

import { useMutation } from "~/hooks/useMutation";
import { api, keys } from "~/lib/query";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { isErrorResponse } from "shared/types/ErrorResponse";
import { Uint8ArrayToBase64 } from "~/lib/encryption/encryption";
import { useHashingWorker } from "~/hooks/useHashingWorker";
import { usePublicVault } from "~/hooks/usePublicVault";

const passwordFormSchema = z.object({
  password: z.string().min(8, {
    message: "password must be at least 8 characters.",
  }),
});

type Props = {
  vaultId: string;
  setIsLocked: (_: boolean) => void;
};

export function PasswordForm({ vaultId, setIsLocked }: Props) {
  const { setKeys, setData } = usePublicVault();
  const $validate = api.vaults[":vaultId"].validate.$post;
  const [isLoading, setIsLoading] = useState(false);
  const { mutate, isPending } = useMutation($validate)({
    mutationKey: keys.password,
    mutationFn: async (args) => {
      const res = await $validate(args);
      if (!res.ok) {
        const error = await res.json();
        if (isErrorResponse(error)) {
          throw new Error(error.error);
        }
      }
      return await res.json();
    },
    onSuccess: async (result) => {
      // TODO: fix this type inference annoyance
      if (!isErrorResponse(result)) {
        toast.success("Successfully Validated Password");
        await setData(
          result.name,
          result.encryptedContent,
          result.iv,
          result.hdkfSalt,
        );
        setIsLocked(false);
      }
    },
    onError(_error, _variables, _context) {
      console.error(_error);
      toast.error("Invalid Password");
    },
  });

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      setIsLoading(true);

      const { masterKey, masterPasswordHash } = await useHashingWorker({
        password: values.password,
        vaultId,
      });
      if (!masterKey || !masterPasswordHash) {
        throw new Error("failed to hash password");
      }
      setKeys(masterKey, masterPasswordHash);

      mutate({
        param: { vaultId },
        json: {
          passwordHash: Uint8ArrayToBase64(masterPasswordHash),
        },
      });
    } catch (e) {
      toast.error(String(e));
    }
    setIsLoading(false);
  };

  const loadingText = isLoading ? "Hashing Password..." : "Validating...";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter the password for your Vault.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      placeholder=""
                      type="password"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              loading={isLoading || isPending}
              loadingText={loadingText}
            >
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
