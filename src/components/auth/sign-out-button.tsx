"use client"

import { signOut, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return <Button disabled>Loading...</Button>
  }

  if (!session) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/"
            },
          },
        })
      }}
    >
      Sign out
    </Button>
  )
}