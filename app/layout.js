import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Mordi e Fuggi",
  description: "Cucina fresca, ritmo veloce",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}