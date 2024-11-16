import { IoSearchOutline } from "react-icons/io5";
import { Input } from "../ui/input";

interface NavSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, isMobile?: boolean) => void;
  isMobile?: boolean;
}

export const NavSearch = ({
  searchTerm,
  onSearchChange,
  onSubmit,
  isMobile = false,
}: NavSearchProps) => (
  <form onSubmit={(e) => onSubmit(e, isMobile)} className="relative group">
    <Input
      type="text"
      placeholder="Search products..."
      className={`${
        isMobile ? "w-full mb-6" : "pl-10 pr-4 w-[400px] focus:w-[500px]"
      } h-11 border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all duration-300`}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    {!isMobile && (
      <IoSearchOutline
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300"
        size={20}
      />
    )}
    <button type="submit" className="sr-only">
      Search
    </button>
  </form>
);
