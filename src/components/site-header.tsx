"use client";

import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { CreditCounter } from "@/components/credits/credit-counter";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import { Palette } from "lucide-react";
import { useSession } from "@/hooks/use-session";

export function SiteHeader() {
  const { session, isLoading } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Palette className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              TattooPreview
            </span>
          </Link>
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Navigation for logged in users */}
          {session?.user && !isLoading && (
            <>
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  href="/tattoo" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Editor
                </Link>
                <Link 
                  href="/credits" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Créditos
                </Link>
              </nav>
              <CreditCounter />
            </>
          )}

          {/* CTA for non-logged users */}
          {!session?.user && !isLoading && (
            <Button asChild size="sm">
              <Link href="/tattoo">
                Começar Grátis
              </Link>
            </Button>
          )}

          <UserProfile />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
