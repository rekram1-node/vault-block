import { toast } from "sonner";
import { noAuthApi } from "~/lib/query";
import { LoginForm } from "~/components/LoginForm";

export function Login() {
  const handleLogin = async () => {
    const result = await noAuthApi.auth.url.$get();

    if (result.ok) {
      window.location.assign((await result.json()).url);
    } else {
      toast.error("failed to login, contact support");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoginForm onClick={handleLogin} />
    </div>
  );
}
