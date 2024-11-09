import { getAuthUser } from "@/lib/actions";
import { memo } from "react";
import Navbar from "./page";

const NavbarWrapper = memo(async () => {
  const user = await getAuthUser();

  // Destructure needed properties once
  const { role } = user || {};

  return <Navbar initialLoggedIn={Boolean(user)} isAdmin={role === "admin"} />;
});

NavbarWrapper.displayName = "NavbarWrapper";

export default NavbarWrapper;
