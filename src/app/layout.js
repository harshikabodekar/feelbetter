// Root layout — loads the two brand fonts and exposes them as CSS variables.
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

// DM Sans = body/UI font, DM Serif Display = headings/greeting/logo
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
});
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
});

export const metadata = {
  title: "feelbetter",
  description: "a safe space for your feelings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerif.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}