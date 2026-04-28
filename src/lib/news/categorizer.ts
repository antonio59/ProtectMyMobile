export type ArticleCategory =
  | "arrest"
  | "seizure"
  | "law_change"
  | "statistics"
  | "prevention_tip"
  | "other";

interface CategoryRule {
  category: ArticleCategory;
  titleKeywords: string[];
  textKeywords: string[];
  textPatterns?: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "arrest",
    titleKeywords: [
      "arrest", "jailed", "sentenced", "convicted", "charged", "court",
    ],
    textKeywords: [
      "arrest", "jail", "prison", "sentenc", "charg", "convict", "prosecut",
      "appear in court", "guilty", "plead",
    ],
  },
  {
    category: "seizure",
    titleKeywords: ["seized", "recovered", "found"],
    textKeywords: [
      "seiz", "recover", "return", "retriev",
    ],
    textPatterns: [/(?:found|returned).*phone/],
  },
  {
    category: "statistics",
    titleKeywords: [
      "statistics", "data shows", "figures", "rise in", "increase in",
      "surge in", "spike in",
    ],
    textKeywords: [
      "statistic", "data", "figures reveal", "report shows", "study finds",
      "research",
    ],
    textPatterns: [/\d+% (increase|rise|surge|higher)/, /\d+,\d+/],
  },
  {
    category: "prevention_tip",
    titleKeywords: [
      "how to protect", "tips", "advice", "prevent", "warning",
    ],
    textKeywords: [
      "protect yourself", "stay safe", "safety tips", "prevent", "avoid",
      "advice", "warning", "be aware", "security tips", "how to keep your phone safe",
    ],
  },
  {
    category: "law_change",
    titleKeywords: [
      "new law", "legislation", "bill", "government announce", "policy",
    ],
    textKeywords: [
      "parliament", "policy change", "regulation",
    ],
    textPatterns: [/(?:law.*new|new.*law)/, /(?:government.*(?:announce|plan))/],
  },
];

export function categorizeArticle(title: string, snippet: string): ArticleCategory {
  const text = (title + " " + snippet).toLowerCase();
  const titleLower = title.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.titleKeywords.some((kw) => titleLower.includes(kw))) {
      return rule.category;
    }
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.textKeywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
    if (rule.textPatterns?.some((re) => re.test(text))) {
      return rule.category;
    }
  }

  // Statistics-specific text heuristics
  if (
    text.includes("number") &&
    ["rise", "increase", "surge", "double"].some((t) => text.includes(t))
  ) {
    return "statistics";
  }
  if (text.includes("rate")) {
    return "statistics";
  }

  // Law-specific heuristics
  if (
    text.includes("police") &&
    ["new", "strategy"].some((t) => text.includes(t))
  ) {
    return "law_change";
  }

  return "other";
}
