"use client"

import { useSession } from "@/lib/auth-client"
import { SignInButton } from "./sign-in-button"
import { SignOutButton } from "./sign-out-button"

export function UserProfile() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <SignInButton />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="text-center">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
        )}
        <h2 className="text-xl font-semibold">{session.user?.name}</h2>
        <p className="text-muted-foreground">{session.user?.email}</p>
      </div>
      <SignOutButton />
    </div>
  )
}