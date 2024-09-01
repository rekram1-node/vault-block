import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Vault } from "./Vault";

export default function ListVaults() {
  return (
    // The transparent borders and background may not be ideal
    // bg-transparent border-transparent
    <Card className="h-auto max-h-[80vh] w-2/3 overflow-y-auto bg-transparent p-4">
      <CardHeader>
        <CardTitle>Your Vaults</CardTitle>
        <CardDescription>
          Manage your vaults and view their content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden w-[200px] md:table-cell">
                Updated at
              </TableHead>
              {/* <TableHead className="text-right"> */}
              <TableHead className="w-[100px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Vault name="Some Vault" />
            <Vault name="Hypernova Headphones" />
            <Vault name="AeroGlow Desk Lamp" />
            <Vault name="TechTonic Energy Drink" />
            {/* <Vault name="Gamer Gear Pro Controller" /> */}
          </TableBody>
        </Table>
      </CardContent>
      {/* <CardFooter> */}
      <CardFooter className="">
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  );
}
