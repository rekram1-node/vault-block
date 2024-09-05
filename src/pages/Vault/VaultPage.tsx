import { useParams } from "wouter";
import { PasswordForm } from "~/components/vaults/PasswordForm";

export function VaultPage() {
  const { id } = useParams();
  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <PasswordForm />
      </div>
    </>
  );
}
