import {
  IoLogOutOutline,
  IoPersonOutline,
  IoCartOutline,
  IoSettingsOutline,
  IoHeartOutline,
  IoShieldCheckmarkOutline,
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
import { Badge } from "../ui/badge";

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
          className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 hover:bg-gray-50 transition-all duration-200 p-0"
        >
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72 animate-in slide-in-from-top-2 p-3 border border-gray-200/50 shadow-xl bg-white/95 backdrop-blur-sm"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold leading-none text-primary">
                My Account
              </p>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                  Admin
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2 bg-gray-100" />
        
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary/5 transition-all duration-200 flex items-center gap-3 p-3 rounded-lg group"
          onClick={() => onNavigate("/profile")}
        >
          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
            <IoPersonOutline className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">Profile</span>
            <span className="text-xs text-muted-foreground">
              View and edit your profile
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary/5 transition-all duration-200 flex items-center gap-3 p-3 rounded-lg group"
          onClick={() => onNavigate("/orders")}
        >
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
            <IoCartOutline className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">My Orders</span>
            <span className="text-xs text-muted-foreground">
              Track your orders and history
            </span>
          </div>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="my-2 bg-gray-100" />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-primary/5 transition-all duration-200 flex items-center gap-3 p-3 rounded-lg group"
              onClick={() => onNavigate("/admin")}
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-200">
                <IoSettingsOutline className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Admin Dashboard</span>
                <span className="text-xs text-muted-foreground">
                  Manage site settings and data
                </span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-2 bg-gray-100" />
        
        <form action={handleLogout}>
          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-3 p-3 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 group"
            asChild
          >
            <button className="w-full flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                <IoLogOutOutline className="h-4 w-4" />
              </div>
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
