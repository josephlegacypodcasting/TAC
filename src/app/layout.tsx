import type { Metadata, Viewport } from "next";
import { Roboto_Flex } from "next/font/google";
import "./globals.css";

const roboto = Roboto_Flex({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const title = "ACA Compliance Exposure Check | TAC Benefits Group";
const description = "Find out your ACA compliance exposure in under 3 minutes.";

export const metadata: Metadata = {
  title,
  description:
    "Ten questions for staffing firm leaders on how associates are measured, offered coverage and reported. Your result shows your exposure level, the findings behind it, and an illustrative estimate at 2026 IRS amounts.",
  robots: { index: true, follow: true },
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary", title, description },
  icons: {
    icon: { url: "/tac-mark.png", type: "image/png", sizes: "512x512" },
    apple: { url: "/tac-mark.png", sizes: "512x512" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
