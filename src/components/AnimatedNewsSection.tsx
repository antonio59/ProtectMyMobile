"use client";

import { motion } from "framer-motion";
import { Newspaper, ArrowRight, Calendar, Tag } from "lucide-react";

interface NewsPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt?: number;
  _creationTime: number;
  featuredImageUrl?: string;
}

interface Props {
  news: NewsPost[];
}

const categoryColors: Record<string, string> = {
  arrest: "from-red-500/10 to-red-500/5 text-red-700 border-red-200 hover:border-red-300",
  seizure: "from-orange-500/10 to-orange-500/5 text-orange-700 border-orange-200 hover:border-orange-300",
  law_change: "from-teal-500/10 to-teal-500/5 text-teal-700 border-teal-200 hover:border-teal-300",
  law_changes: "from-teal-500/10 to-teal-500/5 text-teal-700 border-teal-200 hover:border-teal-300",
  statistics: "from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-200 hover:border-blue-300",
  prevention_tip: "from-green-500/10 to-green-500/5 text-green-700 border-green-200 hover:border-green-300",
  other: "from-neutral-500/10 to-neutral-500/5 text-neutral-700 border-neutral-200 hover:border-neutral-300",
};

const categoryBadgeColors: Record<string, string> = {
  arrest: "bg-red-100 text-red-700 ring-red-600/20",
  seizure: "bg-orange-100 text-orange-700 ring-orange-600/20",
  law_change: "bg-teal-100 text-teal-700 ring-teal-600/20",
  law_changes: "bg-teal-100 text-teal-700 ring-teal-600/20",
  statistics: "bg-blue-100 text-blue-700 ring-blue-600/20",
  prevention_tip: "bg-green-100 text-green-700 ring-green-600/20",
  other: "bg-neutral-100 text-neutral-700 ring-neutral-600/20",
  news: "bg-blue-100 text-blue-700 ring-blue-600/20",
};

const categoryGradients: Record<string, string> = {
  arrest: "from-red-500 to-red-600",
  seizure: "from-orange-500 to-orange-600",
  law_change: "from-teal-500 to-teal-600",
  law_changes: "from-teal-500 to-teal-600",
  statistics: "from-blue-500 to-blue-600",
  prevention_tip: "from-green-500 to-green-600",
  other: "from-neutral-500 to-neutral-600",
  news: "from-blue-500 to-blue-600",
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
  return (
    <section className="mb-8 sm:mb-12">
      <motion.div
        className="flex items-center justify-between mb-6 sm:mb-8 lg:mb-10 gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            Latest Mobile Security News
          </h2>
          <p className="mt-2 text-neutral-600 text-sm sm:text-base max-w-2xl">
            Updates on UK mobile theft trends, policy changes, and safety guides.
          </p>
        </div>
        <motion.a
          href="/news"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-200 shadow-sm text-neutral-600 text-sm font-semibold hover:bg-neutral-50 hover:text-primary hover:border-primary/20 transition-all group whitespace-nowrap"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View All <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </motion.a>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {news.length > 0 ? (
          news.map((post, index) => (
            <motion.a
              key={post._id}
              href={`/news/${post.slug}`}
              className="group flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden ring-1 ring-neutral-100 h-full relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
            >
              {/* Image / Banner Area */}
              <div className="h-48 sm:h-52 overflow-hidden relative bg-neutral-100">
                {post.featuredImageUrl ? (
                  <img 
                    src={post.featuredImageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${categoryGradients[post.category] || categoryGradients.other} opacity-10 group-hover:opacity-15 transition-opacity flex items-center justify-center`}>
                    <Newspaper className={`h-16 w-16 opacity-20 ${categoryColors[post.category]?.split(' ')[1]}`} />
                  </div>
                )}
                
                {/* Floating Category Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md bg-white/90 ring-1 ${categoryBadgeColors[post.category]?.replace('bg-', 'ring-') || 'ring-neutral-200'} ${categoryBadgeColors[post.category]?.match(/text-\w+-\d+/)?.[0] || 'text-neutral-700'}`}
                  >
                    <Tag className="h-3 w-3" />
                    {post.category.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-grow relative">
                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-neutral-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(post.publishedAt || post._creationTime)}</span>
                </div>

                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>

                <p className="text-neutral-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-neutral-100 flex items-center justify-between text-sm font-semibold">
                  <span className="text-primary group-hover:text-primary/80 transition-colors">Read Article</span>
                  <div className="h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))
        ) : (
          <motion.div
            className="col-span-full bg-white border border-dashed border-neutral-200 rounded-2xl p-16 text-center shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-10 w-10 text-blue-500" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              News Coming Soon
            </h3>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              We're preparing the latest updates on UK mobile theft trends,
              arrests, and policy changes. Stay tuned.
            </p>
            <a
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors"
            >
              Check back soon <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        )}
      </div>
      
      <div className="mt-8 text-center sm:hidden">
         <a
          href="/news"
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
        >
          View All News <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
