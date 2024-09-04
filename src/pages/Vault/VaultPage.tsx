import { useParams } from "wouter";

export function VaultPage() {
  const { id } = useParams();
  return <>{id}</>;
}
