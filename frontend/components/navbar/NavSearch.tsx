import { IoSearchOutline } from "react-icons/io5";
import { Input } from "../ui/input";

interface NavSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, isMobile?: boolean) => void;
  isMobile?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  isFocused?: boolean;
}

export const NavSearch = ({
  searchTerm,
  onSearchChange,
  onSubmit,
  isMobile = false,
  onFocus,
  onBlur,
  isFocused = false,
}: NavSearchProps) => (
  <form onSubmit={(e) => onSubmit(e, isMobile)} className="relative group">
    <Input
      type="text"
      placeholder={isMobile ? "Search products..." : "Search wheels, tires, accessories..."}
      className={`${
        isMobile 
          ? "w-full mb-6 h-12 text-base pl-12 pr-4" 
          : `pl-12 pr-4 w-[400px] h-12 text-base ${
              isFocused ? "w-[500px] shadow-lg" : ""
            } transition-all duration-300`
      } border-gray-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-xl`}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
    <IoSearchOutline
      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${
        isFocused 
          ? "text-primary scale-110" 
          : "text-gray-400 group-hover:text-gray-600"
      }`}
      size={20}
    />
    <button type="submit" className="sr-only">
      Search
    </button>
  </form>
);
