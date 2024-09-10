import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { NotionIcon } from "~/components/icons/Icons";

export function LoginForm({ onClick }: { onClick: () => void }) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          To continue, login or signup with Notion.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4"></CardContent>
      <CardFooter>
        {/* Forcing text to be black to match better with Notion Logo */}
        <Button className="w-full text-black" onClick={onClick}>
          <NotionIcon />
          Continue with Notion
        </Button>
      </CardFooter>
    </Card>
  );
}
