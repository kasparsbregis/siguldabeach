"use client";

import Link from "next/link";
import { Volleyball, Medal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080b14]/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-[family-name:var(--font-barlow-condensed)] text-lg font-bold text-gradient-neon">
              King of the Beach
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Pludmales volejbola turnīru pārvaldības rīks. Izloze, rezultāti un
              sezonas reitings vienā vietā.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigācija
            </h4>
            <ul className="mt-3 space-y-2">
              {[
                { href: "/play", label: "Spēlēt", icon: Volleyball },
                { href: "/winners", label: "Uzvarētāji", icon: Medal },
              ].map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-cyan-400"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Par projektu
            </h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Izstrādāja{" "}
              <span className="font-medium text-foreground">Kaspars Breģis</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} Sigulda Beach
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
          <p className="text-xs text-muted-foreground/60">
            Pludmales volejbols · 4 spēlētāji · 3 spēles · 1 karalis
          </p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-muted-foreground">
            <Volleyball className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
