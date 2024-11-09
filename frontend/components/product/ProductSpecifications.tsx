import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Specification } from "@/types/product";
import { memo } from "react";

const TableHeaderContent = memo(() => (
  <TableHeader>
    <TableRow>
      <TableHead className="text-sm lg:text-base">Specification</TableHead>
      <TableHead className="text-sm lg:text-base">Value</TableHead>
    </TableRow>
  </TableHeader>
));

TableHeaderContent.displayName = "TableHeaderContent";

const TableRowContent = memo(({ spec }: { spec: Specification }) => (
  <TableRow>
    <TableCell className="font-medium text-sm lg:text-base">
      {spec.name}
    </TableCell>
    <TableCell className="text-sm lg:text-base">{spec.value}</TableCell>
  </TableRow>
));

TableRowContent.displayName = "TableRowContent";

export const ProductSpecifications = memo(
  ({ specifications }: { specifications: Specification[] }) => {
    return (
      <div>
        <h2 className="text-lg lg:text-xl font-semibold mb-4">
          Product Specifications
        </h2>
        <Table>
          <TableHeaderContent />
          <TableBody>
            {specifications.map((spec, index) => (
              <TableRowContent key={`${spec.name}-${index}`} spec={spec} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
);

ProductSpecifications.displayName = "ProductSpecifications";
