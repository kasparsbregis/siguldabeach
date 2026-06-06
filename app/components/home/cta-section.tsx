"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Medal, Volleyball } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-card/25 p-8 md:flex-row md:items-center md:justify-between md:p-10"
      >
        <div className="flex max-w-xl flex-col gap-3">
          <Badge variant="outline" className="mb-4 gap-1.5 px-2 py-1 w-fit">
            <Volleyball className="w-3 h-3" />
            Sāc tagad
          </Badge>
          <h2 className="text-2xl font-bold uppercase tracking-tight md:text-3xl">
            Gatavs kļūt par{" "}
            <span className="text-gradient-neon">pludmales karali</span>?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Četri spēlētāji, automātiska izloze, reāllaika statistika un
            sezonas reitings — viss vienuviet.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="cursor-pointer rounded-xl px-8 font-semibold"
          >
            <Link href="/play">
              <Volleyball data-icon="inline-start" />
              Sākt turnīru
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="cursor-pointer rounded-xl hover:text-white bg-white/10 hover:bg-white/20"
          >
            <Link href="/winners">
              <Medal data-icon="inline-start" />
              Skatīt reitingu
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
