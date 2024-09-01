import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icon } from "~/components/notion/Icon";

export function LoginForm({ onClick }: { onClick: () => void }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Login to Vault Block to manage your vaults.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" onClick={onClick} variant="outline">
          <Icon />
          Continue with Notion
        </Button>
      </CardFooter>
    </Card>
  );
}
