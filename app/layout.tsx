import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jana Pohl Running",
  description: "Laufquiz von Jana Pohl Running",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
