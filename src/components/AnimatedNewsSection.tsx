"use client";

import { motion } from "framer-motion";
import { Newspaper, ArrowRight } from "lucide-react";

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

const categoryColors: Record<string, string> = {
  arrest: "border-l-red-500 bg-red-50/50",
  seizure: "border-l-orange-500 bg-orange-50/50",
  law_change: "border-l-teal-500 bg-teal-50/50",
  law_changes: "border-l-teal-500 bg-teal-50/50",
  statistics: "border-l-blue-500 bg-blue-50/50",
  prevention_tip: "border-l-green-500 bg-green-50/50",
  other: "border-l-neutral-500 bg-neutral-50/50",
  news: "border-l-blue-500 bg-blue-50/50",
};

const categoryBadgeColors: Record<string, string> = {
  arrest: "bg-red-100 text-red-700",
  seizure: "bg-orange-100 text-orange-700",
  law_change: "bg-teal-100 text-teal-700",
  law_changes: "bg-teal-100 text-teal-700",
  statistics: "bg-blue-100 text-blue-700",
  prevention_tip: "bg-green-100 text-green-700",
  other: "bg-neutral-100 text-neutral-700",
  news: "bg-blue-100 text-blue-700",
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
        className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900">
          Latest Mobile Security News
        </h2>
        <motion.a
          href="/news"
          className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap"
          whileHover={{ x: 4 }}
        >
          View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
        </motion.a>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {news.length > 0 ? (
          news.map((post, index) => (
            <motion.a
              key={post._id}
              href={`/news/${post.slug}`}
              className={`group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 flex flex-col h-full ${categoryColors[post.category] || categoryColors.other}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="p-4 sm:p-6 lg:p-8 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span
                    className={`px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs lg:text-sm font-medium ${categoryBadgeColors[post.category] || categoryBadgeColors.other}`}
                  >
                    {post.category.replace("_", " ")}
                  </span>
                  <span className="text-[10px] sm:text-xs lg:text-sm text-neutral-500">
                    {formatDate(post.publishedAt || post._creationTime)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-1.5 sm:mb-2 lg:mb-3 group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-3 leading-snug">
                  {post.title}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm lg:text-base line-clamp-2 lg:line-clamp-3 leading-relaxed mb-3 sm:mb-4 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-primary font-medium text-xs sm:text-sm lg:text-base mt-auto group-hover:gap-2 transition-all">
                  Read article
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))
        ) : (
          <motion.div
            className="col-span-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Newspaper className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">
              News Coming Soon
            </h3>
            <p className="text-blue-700 mb-4">
              We're preparing the latest updates on UK mobile theft trends,
              arrests, and policy changes.
            </p>
            <a
              href="/news"
              className="text-primary hover:underline font-medium"
            >
              Check back soon →
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
