import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "./context/AppContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "RideLink — Premium Intercity Ride Sharing",
  description: "Share rides, split costs, and travel sustainably. Connect with verified drivers traveling on the same route.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brand-bg text-primary-text font-sans selection:bg-primary-blue/10 selection:text-primary-blue">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
