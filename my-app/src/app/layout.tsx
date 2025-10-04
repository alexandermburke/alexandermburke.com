import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Burke — Software & ML Engineer",
  description: "Personal site for Alex Burke (alexandermburke): projects, stats, and activity."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh body-grid antialiased">{children}</body>
    </html>
  );
}