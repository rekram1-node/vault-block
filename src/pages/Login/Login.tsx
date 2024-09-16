import { api } from "~/lib/api/query";
import { LoginForm } from "~/components/auth/LoginForm";
import { toast } from "sonner";

export function Login() {
  const handleLogin = async () => {
    const result = await api.auth.url.$get();

    if (result.ok) {
      window.location.assign((await result.json()).url);
    } else {
      toast.error("Failed to login, contact support");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm onClick={handleLogin} />
    </div>
  );
}
