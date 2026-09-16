"use client";

import {
  Newspaper,
  ArrowRight,
  Gavel,
  Siren,
  ShieldAlert,
  TrendingUp,
  Lightbulb,
  FileText
} from "lucide-react";
import { useInView } from '../hooks/useInView';

interface NewsPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt?: number;
  _creationTime: number;
}

interface Props {
  news: NewsPost[];
}

const categoryConfig: Record<string, { color: string; icon: any; border: string }> = {
  arrest: { color: "text-destructive-hover", icon: Siren, border: "border-l-destructive" },
  seizure: { color: "text-foreground", icon: ShieldAlert, border: "border-l-foreground" },
  law_change: { color: "text-foreground", icon: Gavel, border: "border-l-foreground" },
  law_changes: { color: "text-foreground", icon: Gavel, border: "border-l-foreground" },
  statistics: { color: "text-primary-hover", icon: TrendingUp, border: "border-l-primary" },
  prevention_tip: { color: "text-foreground", icon: Lightbulb, border: "border-l-foreground" },
  other: { color: "text-muted-foreground", icon: FileText, border: "border-l-muted-foreground" },
};

function formatDate(dateValue: string | number) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Feed titles carry an outlet suffix ("... - dailymail.com"). Split it off so
// the card can show a short headline and credit the outlet as quiet meta text.
function splitTitle(raw: string): { title: string; outlet?: string } {
  const idx = raw.lastIndexOf(" - ");
  if (idx > 0 && raw.length - idx <= 60) {
    return { title: raw.slice(0, idx).trim(), outlet: raw.slice(idx + 3).trim() };
  }
  return { title: raw };
}

export default function AnimatedNewsSection({ news }: Props) {
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="mb-8 sm:mb-12">
      <div
        ref={headerRef}
        className={`flex items-center justify-between mb-6 sm:mb-8 gap-4 animate-on-scroll ${headerInView ? 'is-visible' : ''}`}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
            UK phone theft in the press
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl">
            Updates on UK mobile theft trends, policy changes, and safety guides.
          </p>
        </div>
        <a
          href="/news"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border shadow-sm text-muted-foreground text-sm font-semibold hover:bg-neutral hover:text-primary hover:border-primary/20 transition group whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
        >
          View All <ArrowRight className="size-4 group-hover:translate-x-0.5 group-focus-within:translate-x-0.5 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {news.length > 0 ? (
          news.map((post, index) => {
            const config = categoryConfig[post.category] || categoryConfig.other;
            const Icon = config.icon;

            return (
              <NewsCard
                key={post._id}
                post={post}
                index={index}
                config={config}
                Icon={Icon}
              />
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <a
          href="/news"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
        >
          View All News <ArrowRight className="size-4" />
        </a>
      </div>
    </section>
  );
}

function NewsCard({ post, index, config, Icon }: { post: NewsPost; index: number; config: any; Icon: any }) {
  const { ref, isInView } = useInView<HTMLAnchorElement>({ rootMargin: '-50px', threshold: 0.1 });
  const { title, outlet } = splitTitle(post.title);

  return (
    <a
      ref={ref}
      href={`/news/${post.slug}`}
      className={`group flex flex-col bg-card rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-border border-l-4 ${config.border} hover:-translate-y-1 animate-on-scroll ${isInView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5 sm:p-6 flex flex-col flex-grow gap-3">
        {/* Meta: category · date · outlet — one quiet line, no pills */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Icon className={`size-3.5 shrink-0 ${config.color}`} />
          <span className={`font-semibold capitalize ${config.color}`}>
            {post.category.replace(/_/g, " ")}
          </span>
          <span aria-hidden="true">·</span>
          <time>{formatDate(post.publishedAt || post._creationTime)}</time>
          {outlet && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{outlet}</span>
            </>
          )}
        </div>

        {/* Headline — outlet suffix stripped, shown in full so readers can
            judge the story before clicking */}
        <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary group-focus-within:text-primary transition-colors leading-snug">
          {title}
        </h3>

        {/* Excerpt — 2 lines max */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center text-sm font-semibold text-primary mt-auto pt-1 group-hover:gap-2 group-focus-within:gap-2 transition-all">
          Read article
          <ArrowRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}

function EmptyState() {
  const { ref, isInView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`col-span-full bg-card border border-dashed border-border rounded-2xl p-16 text-center shadow-sm animate-on-scroll-scale ${isInView ? 'is-visible' : ''}`}
    >
      <div
        className={`w-20 h-20 bg-primary-subtle rounded-full flex items-center justify-center mx-auto mb-6 animate-pop-in ${isInView ? 'is-visible' : ''}`}
        style={{ animationDelay: '200ms' }}
      >
        <Newspaper className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        Latest News
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Visit our news page for the latest updates on UK mobile theft trends,
        arrests, and policy changes.
      </p>
      <a
        href="/news"
        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-foreground text-background rounded-xl font-semibold hover:bg-primary-hover transition-colors"
      >
        View all news <ArrowRight className="size-4" />
      </a>
    </div>
  );
}
