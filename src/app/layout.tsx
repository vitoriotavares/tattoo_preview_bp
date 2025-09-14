import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Oswald, Merriweather, Fira_Code } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SeoSchema } from "@/components/seo-schema";

const oswald = Oswald({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TattooPreview - Teste Tatuagem em Poucos Segundos | IA Grátis",
  description:
    "3 testes grátis! Veja como fica a tatuagem em você. Upload foto → Escolha design → Resultado em segundos com IA Google Gemini 2.5 Flash ✨",
  keywords: "testar tatuagem, simulador tatuagem grátis, como fica tatuagem, app tatuagem foto, tatuagem virtual",
  openGraph: {
    title: "TattooPreview - Teste Tatuagem em 10 Segundos",
    description: "3 testes grátis! Veja como fica a tatuagem em você. Resultado em segundos com IA.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "TattooPreview - Teste Tatuagem em 10 Segundos",
    description: "3 testes grátis! Veja como fica a tatuagem em você. Resultado em segundos com IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${merriweather.variable} ${firaCode.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SeoSchema />
          <QueryProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
