import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Specification } from "@/types/product";

export function ProductSpecifications({
  specifications,
}: {
  specifications: Specification[];
}) {
  return (
    <div>
      <h2 className="text-lg lg:text-xl font-semibold mb-4">
        Product Specifications
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm lg:text-base">
              Specification
            </TableHead>
            <TableHead className="text-sm lg:text-base">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {specifications.map((spec, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-sm lg:text-base">
                {spec.name}
              </TableCell>
              <TableCell className="text-sm lg:text-base">
                {spec.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
