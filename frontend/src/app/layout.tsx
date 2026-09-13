import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "National Digital Platform for Land Governance | SIH 26019",
  description: "Ministry of Rural Development & Department of Land Resources (DoLR) Evidence-Based Land Governance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex flex-1 w-full">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
