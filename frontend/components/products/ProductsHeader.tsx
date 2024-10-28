import { Input } from "@/components/ui/input";

interface ProductsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ProductsHeader = ({
  searchTerm,
  onSearchChange,
}: ProductsHeaderProps) => {
  return (
    <section className="bg-white shadow-sm py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="md:w-1/2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Our Products
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Discover our curated collection of premium products
            </p>
          </div>
          <div className="md:w-1/2">
            <Input
              type="text"
              placeholder="Search by name, brand, or category..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 text-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
