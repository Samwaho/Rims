import {
  IoLogOutOutline,
  IoPersonOutline,
  IoCartOutline,
  IoSettingsOutline,
} from "react-icons/io5";
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
import { useRouter } from "next/navigation";

interface UserDropdownProps {
  onNavigate: (path: string) => void;
  isAdmin?: boolean;
  children: React.ReactNode;
  onLogout: () => void;
}

export const UserDropdown = ({
  onNavigate,
  isAdmin,
  children,
  onLogout,
}: UserDropdownProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    onLogout();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
        >
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 animate-in slide-in-from-top-2 p-2"
        align="end"
      >
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-primary">
              My Account
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3 p-3 rounded-md"
          onClick={() => onNavigate("/profile")}
        >
          <IoPersonOutline className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">Profile</span>
            <span className="text-xs text-muted-foreground">
              View and edit your profile
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3 p-3 rounded-md"
          onClick={() => onNavigate("/orders")}
        >
          <IoCartOutline className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">Orders</span>
            <span className="text-xs text-muted-foreground">
              View your order history
            </span>
          </div>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem
            className="cursor-pointer hover:bg-primary/10 transition-colors flex items-center gap-3 p-3 rounded-md"
            onClick={() => onNavigate("/admin")}
          >
            <IoSettingsOutline className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Admin Dashboard</span>
              <span className="text-xs text-muted-foreground">
                Manage site settings
              </span>
            </div>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-2" />
        <form action={handleLogout}>
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-3 p-3 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            asChild
          >
            <button className="w-full flex items-center gap-3">
              <IoLogOutOutline className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Logout</span>
                <span className="text-xs text-red-400">
                  Sign out of your account
                </span>
              </div>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
