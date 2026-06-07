import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../lib/web3/Web3Provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shared Agent Notebook",
  description: "A tamper-evident shared scratchpad for multi-agent workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#09090B] text-white">
        <Web3Provider>
          {children}
        </Web3Provider>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
