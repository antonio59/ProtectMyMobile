"use client";

import {
  Newspaper,
  ArrowRight,
  Calendar,
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

const categoryConfig: Record<string, { color: string; bg: string; icon: any; gradient: string }> = {
  arrest: {
    color: "text-destructive-hover",
    bg: "bg-destructive-subtle",
    icon: Siren,
    gradient: "from-destructive to-destructive-hover",
  },
  seizure: {
    color: "text-foreground",
    bg: "bg-neutral-100",
    icon: ShieldAlert,
    gradient: "from-foreground to-foreground",
  },
  law_change: {
    color: "text-foreground",
    bg: "bg-neutral-100",
    icon: Gavel,
    gradient: "from-foreground to-foreground",
  },
  law_changes: {
    color: "text-foreground",
    bg: "bg-neutral-100",
    icon: Gavel,
    gradient: "from-foreground to-foreground",
  },
  statistics: {
    color: "text-primary-hover",
    bg: "bg-primary-subtle",
    icon: TrendingUp,
    gradient: "from-primary to-primary",
  },
  prevention_tip: {
    color: "text-foreground",
    bg: "bg-neutral-100",
    icon: Lightbulb,
    gradient: "from-foreground to-foreground",
  },
  other: {
    color: "text-foreground",
    bg: "bg-neutral",
    icon: FileText,
    gradient: "from-neutral-500 to-neutral-600",
  },
};

function formatDate(dateValue: string | number) {
  const date =
    typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
            Latest Mobile Security News
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-2xl">
            Updates on UK mobile theft trends, policy changes, and safety guides.
          </p>
        </div>
        <a
          href="/news"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border shadow-sm text-muted-foreground text-sm font-semibold hover:bg-neutral hover:text-primary hover:border-primary/20 transition-all group whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
        >
          View All <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
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
  
  const borderColor = post.category === 'arrest' ? '#C8322B' : 
                      post.category === 'seizure' ? '#B06000' : 
                      post.category === 'law_change' ? '#2F6B4F' : 
                      post.category === 'statistics' ? '#16130F' : 
                      post.category === 'prevention_tip' ? '#2F6B4F' : 
                      '#6B6459';

  return (
    <a
      ref={ref}
      href={`/news/${post.slug}`}
      className={`group flex flex-col bg-card rounded-xl shadow-sm hover: hover:shadow-primary/5 transition-all duration-300 border-l-4 border-t border-r border-b border-border hover:border-r-primary/20 hover:border-t-primary/20 hover:border-b-primary/20 h-full relative overflow-hidden hover:-translate-y-1 animate-on-scroll ${isInView ? 'is-visible' : ''}`}
      style={{ animationDelay: `${index * 50}ms`, borderLeftColor: borderColor }}
    >
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        {/* Meta Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {post.category.replace("_", " ")}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt || post._creationTime)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all mt-auto">
          Read article
          <ArrowRight className="size-4 ml-1 transition-transform" />
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
        className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-primary-hover transition-colors"
      >
        View all news <ArrowRight className="size-4" />
      </a>
    </div>
  );
}
