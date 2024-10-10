import { useLocation } from "wouter";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <p className="mt-4 text-2xl text-foreground">Oops! Page not found.</p>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="mt-6 bg-primary text-primary-foreground hover:bg-primary/80"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
