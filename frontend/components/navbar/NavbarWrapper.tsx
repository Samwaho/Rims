import { getAuthUser } from "@/lib/actions";
import Navbar from "./page";

const NavbarWrapper = async () => {
  const user = await getAuthUser();
  return <Navbar initialLoggedIn={!!user} isAdmin={user?.role === "admin"} />;
};

export default NavbarWrapper;
