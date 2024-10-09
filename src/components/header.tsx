"use client";

import Avatar from "./avatar";
import WithIcon from "./with-icon";
import Icon from "./icon";
import { faGear, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { ThemeToggle } from "./theme-toggle";
import Logo from "./logo";
import { useAuth, User } from "@healthlab/firebase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@healthlab/ui";

const UserMenu = ({ user }: { user: User }) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const onSignOut = async () => {
    const token = await user.getIdToken();
    await fetch("/api/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <WithIcon icon={<Avatar src={user.photoURL} alt="User Avatar" />}>{user.displayName || ""}</WithIcon>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <WithIcon icon={<Icon icon={faGear} />}>Settings</WithIcon>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>
          <WithIcon icon={<Icon icon={faSignOut} />}>Sign Out</WithIcon>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-background/95 dark:border-b shadow dark:shadow-none">
      <div className="container h-14 flex items-center justify-between">
        <Logo />
        <div className="flex gap-3 items-center">
          {user && <UserMenu user={user} />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
