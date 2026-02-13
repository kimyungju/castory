"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const fetchNewsForTopic = action({
  args: {
    topic: v.string(),
    articleCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const openai = new OpenAI({ apiKey });
    const count = args.articleCount ?? 5;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      tools: [{ type: "web_search" }],
      input: `Find the top ${count} trending ${args.topic} news articles from today. Return ONLY a JSON array with no other text. Each item should have: title (string), summary (2-3 sentence summary), source (publication name), url (article URL). Format: [{"title":"...","summary":"...","source":"...","url":"..."}]`,
    });

    const text = response.output_text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse news articles from search results");

    return JSON.parse(jsonMatch[0]);
  },
});

export const generateNewsScript = action({
  args: {
    topic: v.string(),
    articles: v.array(
      v.object({
        title: v.string(),
        summary: v.string(),
        source: v.string(),
        url: v.string(),
      })
    ),
    tone: v.optional(v.string()),
    duration: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const openai = new OpenAI({ apiKey });

    const tone = args.tone ?? "casual";
    const duration = args.duration ?? "medium";

    const wordGuide: Record<string, string> = {
      short: "~500 words (about 2 minutes)",
      medium: "~1200 words (about 5 minutes)",
      long: "~2500 words (about 10 minutes)",
    };
    const targetLength = wordGuide[duration] ?? wordGuide.medium;

    const articleSummaries = args.articles
      .map((a, i) => `${i + 1}. "${a.title}" (${a.source}): ${a.summary}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a podcast script writer. Write engaging, natural-sounding podcast scripts that are meant to be read aloud. Use a ${tone} tone. Do not include stage directions, sound effects, or speaker labels — just the spoken text.`,
        },
        {
          role: "user",
          content: `Write a ${tone} podcast script about today's top ${args.topic} news. Target length: ${targetLength}.

Articles to cover:
${articleSummaries}

Requirements:
- Start with a brief, engaging intro greeting
- Cover each article with smooth transitions
- Add brief commentary or context where appropriate
- End with a natural sign-off
- Write ONLY the spoken text, no formatting or labels`,
        },
      ],
    });

    return response.choices[0]?.message?.content ?? "";
  },
});
