"use client";

import { AnimatedBackground } from "@/components/animated-background";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function PageShell({
  children,
  fullWidth = false,
}: PageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
      <main
        className={`mx-auto w-full flex-1 px-4 pb-8 pt-2 md:px-6 ${
          fullWidth ? "max-w-7xl" : "max-w-6xl"
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
