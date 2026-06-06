"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Medal, Volleyball, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Sākums", exact: true },
  { href: "/play", label: "Spēlēt", icon: Volleyball },
  { href: "/winners", label: "Uzvarētāji", icon: Medal },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0a0e1a]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-3"
        >
          <div className="relative">
            <Image
              src="/kingofthebeach-logo.png"
              alt="King of the Beach"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full transition-all duration-200"
            />
            <div className="absolute inset-0 rounded-full bg-cyan-400/10 opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-100" />
          </div>
          <div className="hidden sm:block">
            <span className="block font-[family-name:var(--font-barlow-condensed)] text-base font-bold tracking-tight text-foreground">
              King of the Beach
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
              Sigulda Beach
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, exact, icon: Icon }) => {
            const isActive = exact ? pathname === href : pathname === href;
            return (
              <Link key={href} href={href} className="cursor-pointer">
                <span
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-cyan-300"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  {Icon && <Icon className="relative h-4 w-4" />}
                  <span className="relative">{label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/play" className="cursor-pointer md:hidden">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer text-cyan-400"
            >
              <Volleyball className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/winners" className="cursor-pointer md:hidden">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer text-amber-400"
            >
              <Medal className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/play" className="hidden cursor-pointer sm:block">
            <Button
              size="sm"
              className="cursor-pointer rounded-lg bg-cyan-500 font-semibold text-[#0a0e1a] transition-all duration-200 hover:bg-cyan-400 glow-cyan"
            >
              Sākt spēli
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
