"use client";

import { useCredits } from "@/hooks/use-credits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Star, Zap, Crown, Sparkles } from "lucide-react";
import { useState } from "react";

const packageIcons = {
  Starter: <Coins className="h-5 w-5" />,
  Popular: <Star className="h-5 w-5" />,
  Pro: <Zap className="h-5 w-5" />,
  Studio: <Crown className="h-5 w-5" />,
};

const packageColors = {
  Starter: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
  Popular: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800 ring-2 ring-green-200 dark:ring-green-800",
  Pro: "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800",
  Studio: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
};

export function PackageCards() {
  const { packages, formatPrice, createCheckoutSession, isCreatingCheckout } = useCredits();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);

  if (!packages || packages.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="w-20 h-6 bg-muted rounded" />
              <div className="w-32 h-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded" />
            </CardContent>
            <CardFooter>
              <div className="w-full h-9 bg-muted rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const handlePurchase = async (packageId: string, packageName: string) => {
    try {
      setLoadingPackage(packageId);
      const { url } = await createCheckoutSession(packageId);
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // You might want to show a toast notification here
    } finally {
      setLoadingPackage(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {packages.map((pkg) => {
        const isLoading = loadingPackage === pkg.id;
        const pricePerCredit = parseFloat(pkg.price) / 100 / pkg.credits;
        
        return (
          <Card 
            key={pkg.id}
            className={`relative transition-all duration-200 hover:scale-105 ${
              packageColors[pkg.name as keyof typeof packageColors] || ""
            }`}
          >
            {pkg.name === "Popular" && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Mais Popular
              </Badge>
            )}

            <CardHeader className="text-center pb-3">
              <div className="mx-auto mb-2 p-2 rounded-full bg-background/80 w-fit">
                {packageIcons[pkg.name as keyof typeof packageIcons]}
              </div>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>
                {pkg.credits} {pkg.credits === 1 ? "crédito" : "créditos"}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center pb-3">
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatPrice(pkg.price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ~{formatPrice((pricePerCredit * 100).toString())} por crédito
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handlePurchase(pkg.id, pkg.name)}
                disabled={isLoading || isCreatingCheckout}
                variant={pkg.name === "Popular" ? "default" : "outline"}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando...
                  </div>
                ) : (
                  "Comprar Agora"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}