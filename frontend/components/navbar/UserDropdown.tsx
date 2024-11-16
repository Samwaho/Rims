import { IoLogOutOutline, IoPersonOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions";

interface UserDropdownProps {
  onNavigate: (path: string) => void;
  isAdmin?: boolean;
}

export const UserDropdown = ({ onNavigate, isAdmin }: UserDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 transform hover:scale-105 transition-all duration-300"
      >
        <IoPersonOutline size={20} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      className="w-56 animate-in slide-in-from-top-2"
      align="end"
    >
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => onNavigate("/profile")}
      >
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer hover:bg-primary/10 transition-colors"
        onClick={() => onNavigate("/orders")}
      >
        Orders
      </DropdownMenuItem>
      {isAdmin && (
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() => onNavigate("/admin")}
        >
          Admin Dashboard
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <form action={logout}>
        <DropdownMenuItem
          className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          asChild
        >
          <button className="w-full flex items-center gap-2">
            <IoLogOutOutline size={20} />
            <span>Logout</span>
          </button>
        </DropdownMenuItem>
      </form>
    </DropdownMenuContent>
  </DropdownMenu>
);
