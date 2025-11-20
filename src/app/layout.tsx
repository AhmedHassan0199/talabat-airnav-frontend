import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { AuthProvider } from "../components/AuthProvider";
import { CartProvider } from "../components/CartProvider";

export const metadata: Metadata = {
  title: "سوق الكمبوند",
  description: "Portal للطلبات بين الجيران (Talabat Style)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
