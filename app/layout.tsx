import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.HOST_URL ?? "http://localhost:3000"),
  title: "Kagaz",
  description: "Smart note-taking editor",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "Kagaz",
    description: "Smart note-taking editor",
    url: "http://localhost:3000",
    siteName: "Kagaz",
    images: [
      {
        url: "/home-page.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kagaz",
    description: "Smart note-taking editor",
    images: ["/home-page.png"],
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

import { dark } from "@clerk/themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            dynamic
            appearance={{
              // baseTheme: dark, // We can't easily dynamic this in RootLayout without a client component
              variables: {
                colorPrimary: "#d8b131",
                colorTextOnPrimaryBackground: "#ffffff",
                borderRadius: "0.8rem",
              },
              elements: {
                card: "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-border/40 bg-card rounded-[2.5rem] p-6 backdrop-blur-sm",
                headerTitle: "text-3xl font-black tracking-tight text-foreground",
                headerSubtitle: "text-muted-foreground font-medium text-sm",
                socialButtonsBlockButton: "border border-border/60 hover:bg-muted/50 text-foreground transition-all duration-300 rounded-2xl h-12",
                socialButtonsBlockButtonText: "font-bold text-sm",
                formButtonPrimary: "bg-[#d8b131] hover:bg-[#c49e2b] shadow-[0_10px_20px_rgba(216,177,49,0.2)] transition-all active:scale-95 font-black rounded-2xl h-12 uppercase tracking-widest text-xs",
                footerActionLink: "text-[#d8b131] hover:text-[#c49e2b] font-black",
                identityPreviewText: "text-foreground font-bold",
                identityPreviewEditButtonIcon: "text-foreground",
                formFieldLabel: "text-foreground/80 font-black text-xs uppercase tracking-widest mb-1.5",
                formFieldInput: "bg-muted/20 border-border/40 focus:border-[#d8b131] focus:ring-[#d8b131]/10 rounded-2xl h-11 transition-all",
                formFieldRow: "grid grid-cols-2 gap-4",
                dividerLine: "bg-border/30",
                dividerText: "text-muted-foreground/60 uppercase text-[12px] font-black tracking-[0.3em]",
                formFieldAction: "text-[#d8b131] hover:text-[#c49e2b] font-bold text-xs",
              },
            }}
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ClerkProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
