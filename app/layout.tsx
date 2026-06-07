import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Pathora — Historic Castles & Fortresses",
  description:
    "A focused map of castles and fortresses in Hessen, Rheinland-Pfalz, Baden-Württemberg, and Bavaria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
