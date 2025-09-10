"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function SignInButton() {
  const { data: session, isPending } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isPending) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (session) {
    return null;
  }

  return (
    <Button
      disabled={isSigningIn}
      onClick={async () => {
        setIsSigningIn(true);
        try {
          await signIn.social({
            provider: "google",
            callbackURL: "/tattoo",
          });
        } catch (error) {
          console.error("Sign in error:", error);
        } finally {
          setIsSigningIn(false);
        }
      }}
    >
      {isSigningIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}
