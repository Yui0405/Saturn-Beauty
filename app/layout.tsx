import type { Metadata } from "next";
import { Playfair_Display, Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/contexts/notification-context";
import { FollowProvider } from "@/contexts/follow-context";
import ClientLayout from "@/components/client-layout";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  fallback: ["serif"],
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  fallback: ["system-ui", "arial"],
  preload: true,
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
  weight: ["400", "500", "600", "700"],
  fallback: ["cursive"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Saturn Beauty - Cosméticos Naturales",
  description:
    "Descubre la belleza natural con Saturn Beauty, cosméticos naturales inspirados en la naturaleza.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${poppins.variable} ${dancingScript.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <FollowProvider>
                  <ClientLayout>{children}</ClientLayout>
                  <Toaster />
                </FollowProvider>
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
