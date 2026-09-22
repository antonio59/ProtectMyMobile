// TypeSafe (Jev) news-judgment layer for the import pipeline.
//
// Replaces the keyword heuristics in scorer.ts / geo.ts / categorizer.ts when
// a TYPESAFE_API_KEY is configured. One systemOne call per candidate article
// asks four independent questions in parallel; the code then owns the import
// decision. When the key is absent or a call fails, callers fall back to the
// keyword path — the pipeline never depends on the model being up.
//
// The API key must only ever live server-side (worker binding / .dev.vars),
// never in a PUBLIC_ env var or the client bundle.

import { TypeSafeClient, choice, noul, score, type Fetch } from "@typesafe-ai/sdk";
import type { ArticleCategory } from "./categorizer";

/** Noul probabilities inside this band mean "don't know" — hold for review. */
const UNCERTAIN_BAND: [number, number] = [0.35, 0.65];
/** Choice/Score confidence below this is too shaky to auto-publish on. */
const MIN_CONFIDENCE = 0.4;
/** Editorial floor for import (0–4 rubric): "useful" starts at 2. */
const MIN_EDITORIAL = 1.5;
/** Semantic dedup: same-story probability that counts as a duplicate. */
const SAME_STORY_THRESHOLD = 0.6;

export interface ArticleVerdict {
  shouldImport: boolean;
  /** Hold as a draft for admin review instead of auto-publishing. */
  holdForReview: boolean;
  category: ArticleCategory;
  /** 0–100 ordering score, comparable to the keyword pipeline's scale. */
  relevanceScore: number;
  reason: string;
}

const CATEGORY_LABELS: ArticleCategory[] = [
  "arrest",
  "seizure",
  "law_change",
  "statistics",
  "prevention_tip",
  "other",
];

export function createJudge(apiKey?: string, opts?: { fetch?: Fetch }) {
  if (!apiKey) return null;
  const client = new TypeSafeClient({ apiKey, logLevel: "warn", ...opts });

  async function judgeArticle(input: {
    title: string;
    excerpt: string;
    sourceName?: string;
    sourceUrl?: string;
  }): Promise<ArticleVerdict> {
    const result = await client.systemOne({
      state: {
        title: input.title,
        excerpt: input.excerpt,
        source_name: input.sourceName ?? null,
        source_url: input.sourceUrl ?? null,
      },
      questions: {
        onTopic: noul(
          "Does this article report on the theft, robbery or snatching of mobile phones — or a directly related story such as an arrest or sentencing for phone theft, a policing crackdown, seizure of stolen phones, new phone-theft statistics, government policy on phone theft, or advice about protecting a phone from theft?",
          {
            true: "Phone theft or a directly related enforcement/policy/advice story.",
            false:
              "Not about phone theft: other stolen items, phone contracts, coverage, screen time, apps, or unrelated crime.",
          },
        ),
        uk: noul("Is this article about events, people or policies in the United Kingdom?", {
          true:
            "Events in England, Scotland, Wales or Northern Ireland, or UK police forces, courts, parliament or national UK statistics.",
          false: "The story concerns another country — a foreign city, police force, court or legislature.",
        }),
        category: choice("Which category best fits this article?", {
          arrest: "Someone was arrested, charged, convicted or sentenced.",
          seizure: "Stolen phones were seized, recovered or returned to owners.",
          law_change: "A new law, government policy or policing strategy was announced.",
          statistics: "The article is mainly about new data, figures or research on theft.",
          prevention_tip: "The article is mainly advice on protecting phones or staying safe.",
          other: "A phone-theft story that fits none of the above.",
        }),
        editorial: score(
          "How useful is this article to a UK reader worried about phone theft?",
          [
            "Not useful — off-topic or a passing mention.",
            "Marginal — generic crime roundup with a brief phone-theft mention.",
            "Useful — a real phone-theft story with specifics such as place or outcome.",
            "Valuable — a significant incident, conviction, dataset or policy with substance.",
            "Essential — a major development such as a big crackdown, law change or landmark statistics.",
          ] as const,
        ),
      },
    });

    const { onTopic, uk, category, editorial } = result.answers;
    const uncertain =
      (onTopic.noul >= UNCERTAIN_BAND[0] && onTopic.noul <= UNCERTAIN_BAND[1]) ||
      (uk.noul >= UNCERTAIN_BAND[0] && uk.noul <= UNCERTAIN_BAND[1]);

    const shouldImport =
      onTopic.noul >= 0.5 && uk.noul >= 0.5 && editorial.score >= MIN_EDITORIAL;

    const cat: ArticleCategory = CATEGORY_LABELS.includes(category.choice as ArticleCategory)
      ? (category.choice as ArticleCategory)
      : "other";

    return {
      shouldImport,
      holdForReview:
        shouldImport &&
        (uncertain ||
          category.confidence < MIN_CONFIDENCE ||
          editorial.confidence < MIN_CONFIDENCE),
      category: cat,
      relevanceScore: Math.round((editorial.score / 4) * 100),
      reason: `topic=${onTopic.noul.toFixed(2)} uk=${uk.noul.toFixed(2)} editorial=${editorial.score.toFixed(1)} cat=${cat}`,
    };
  }

  /**
   * Semantic dedup for headline pairs the token matcher can't decide —
   * reworded reports of the same event share few tokens.
   */
  async function sameStory(headlineA: string, headlineB: string): Promise<number> {
    const result = await client.systemOne({
      state: { headline_a: headlineA, headline_b: headlineB },
      questions: {
        same: noul(
          "Do these two headlines report the same underlying event or story, even if worded differently or from different outlets?",
          {
            true: "Same event — same people, place and incident or announcement.",
            false: "Different events, or the same topic but distinct incidents.",
          },
        ),
      },
    });
    return result.answers.same.noul;
  }

  return { client, judgeArticle, sameStory, SAME_STORY_THRESHOLD };
}

export type NewsJudge = NonNullable<ReturnType<typeof createJudge>>;
