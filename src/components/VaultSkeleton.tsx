import { TableCell, TableRow } from "~/components/ui/table";
import { Skeleton } from "./ui/skeleton";

export function VaultSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-3/4 rounded" />
      </TableCell>
      <TableCell className="hidden animate-pulse md:table-cell">
        <Skeleton className="h-4 w-3/4 rounded" />
      </TableCell>
      <TableCell className="flex items-center justify-end">
        <Skeleton className="h-4 w-8" />
      </TableCell>
    </TableRow>
  );
}
