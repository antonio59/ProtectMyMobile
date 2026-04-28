import type { NewsSource } from "./types";

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=UK+mobile+phone+theft+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    priority: 1,
  },
  {
    name: "Google News (Smartphone)",
    url: "https://news.google.com/rss/search?q=smartphone+theft+UK+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    priority: 2,
  },
  {
    name: "Guardian UK",
    url: "https://www.theguardian.com/uk/rss",
    priority: 3,
  },
  {
    name: "Guardian UK Crime",
    url: "https://www.theguardian.com/uk/crime/rss",
    priority: 4,
  },
  {
    name: "Sky News UK",
    url: "https://feeds.skynews.com/feeds/rss/uk.xml",
    priority: 5,
  },
  {
    name: "The Independent UK News",
    url: "https://www.independent.co.uk/news/uk/rss",
    priority: 6,
  },
  {
    name: "Evening Standard",
    url: "https://www.standard.co.uk/rss",
    priority: 7,
  },
  {
    name: "Metro UK News",
    url: "https://metro.co.uk/news/uk/feed/",
    priority: 8,
  },
  {
    name: "Daily Mail UK News",
    url: "https://www.dailymail.co.uk/news/uk/index.rss",
    priority: 9,
  },
  {
    name: "The Telegraph UK",
    url: "https://www.telegraph.co.uk/news/rss.xml",
    priority: 10,
  },
  {
    name: "Mirror UK News",
    url: "https://www.mirror.co.uk/news/uk-news/rss.xml",
    priority: 11,
  },
  {
    name: "ITV News",
    url: "https://www.itv.com/news/rss/",
    priority: 12,
  },
];
