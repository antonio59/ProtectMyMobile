"use client";

import { useState } from "react";
import { SITE_HOST } from "@/lib/site";

type Card = {
  kicker: string;
  body: string;
  source: string;
  variant: "ink" | "paper" | "outline";
};

export default function StatShareGrid({ cards }: { cards: Card[] }) {
  const [copied, setCopied] = useState<number | null>(null);

  async function share(index: number, card: Card) {
    const text = `${card.body}\n${card.source}\n${SITE_HOST}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url: `https://${SITE_HOST}` });
        return;
      }
    } catch {
      /* user cancelled */
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4 sm:mb-6 pb-3 border-b-[3px] border-foreground">
        <h2 className="text-foreground">Share a stat</h2>
        <p className="text-sm text-muted-foreground">Copy or share to Instagram, X or WhatsApp</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {cards.map((card, index) => {
          const shell =
            card.variant === "ink"
              ? "bg-foreground text-background"
              : card.variant === "paper"
                ? "bg-neutral-100 text-foreground"
                : "bg-background border-2 border-foreground text-foreground";
          const kicker =
            card.variant === "ink"
              ? "text-background/70"
              : card.variant === "outline"
                ? "text-destructive"
                : "text-muted-foreground";
          const meta =
            card.variant === "ink" ? "text-neutral-400" : "text-muted-foreground";
          return (
            <div key={card.kicker} className={`${shell} p-6 sm:p-7 flex flex-col justify-between gap-4 min-h-[16rem] rounded-xl`}>
              <span className={`text-xs font-bold uppercase tracking-[0.15em] ${kicker}`}>
                {card.kicker}
              </span>
              <span className="font-serif text-2xl lg:text-3xl leading-tight">{card.body}</span>
              <div className="flex flex-col gap-2">
                <span className={`text-xs ${meta}`}>{card.source}</span>
                <span className={`text-xs ${meta}`}>{SITE_HOST}</span>
                <button
                  type="button"
                  onClick={() => void share(index, card)}
                  className={`self-start text-xs font-semibold underline underline-offset-2 ${card.variant === "ink" ? "text-background" : "text-foreground"}`}
                >
                  {copied === index ? "Copied" : "Share"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
