"use client"
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "@/store";
import ClientProvider from "./client-provider";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

  return (
    <html lang="en">
      <body className={outfit.variable}>
      <Provider store={store}> {/* Wrapping the entire app with Provider */}
        <GoogleOAuthProvider clientId={googleClientId}>
          <Navbar /> {/* Header present on every page */}
          <ClientProvider> {/* Logic inside ClientProvider */}
            <main style={{ marginTop: '64px' }}>
              {children}
            </main>
          </ClientProvider>
          </GoogleOAuthProvider>;
        </Provider>
      </body>
    </html>
  );
}
