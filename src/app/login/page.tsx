"use client";

import { AuthTabs, User } from "@healthlab/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const onLoggedIn = async (user: User) => {
    const token = await user.getIdToken();

    await fetch("/api/login", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    router.refresh();
  };

  return <AuthTabs className="mt-10 max-w-md mx-auto" onLoggedIn={onLoggedIn} />;
}
