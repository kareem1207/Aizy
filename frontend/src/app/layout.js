import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Header } from "@/ui/Header";
import { Footer } from "@/ui/Footer";
import { Toaster } from "@/components/Toaster";

export const metadata = {
  title: "Aizy — AI-powered shopping",
  description:
    "Aizy is a full-stack store with an AI fashion stylist and sales forecasting for sellers. Try the live demo, no sign-up needed.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <Header />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
