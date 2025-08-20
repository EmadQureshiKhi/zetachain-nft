import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MultiChainWalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Universal NFT - Cross-Chain NFT Platform",
  description: "Transfer NFTs seamlessly across Solana, Ethereum, and BNB Chain via ZetaChain",
  keywords: ["NFT", "cross-chain", "Solana", "Ethereum", "BNB", "ZetaChain", "blockchain"],
  authors: [{ name: "Universal NFT Team" }],
  openGraph: {
    title: "Universal NFT - Cross-Chain NFT Platform",
    description: "Transfer NFTs seamlessly across multiple blockchains",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        <MultiChainWalletProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
            }}
          />
        </MultiChainWalletProvider>
      </body>
    </html>
  );
}
