"use client";

import { useSession } from "@/lib/auth-client";
import { SignInButton } from "./sign-in-button";
import { SignOutButton } from "./sign-out-button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <SignInButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="text-center">
        <Avatar className="size-16 mx-auto mb-4">
          <AvatarImage
            src={session.user?.image || ""}
            alt={session.user?.name || "User"}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>
            {(
              session.user?.name?.[0] ||
              session.user?.email?.[0] ||
              "U"
            ).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{session.user?.name}</h2>
        <p className="text-muted-foreground">{session.user?.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
