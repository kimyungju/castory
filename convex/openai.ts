"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const generateAudioAction = action({
  args: {
    input: v.string(),
    voice: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const openai = new OpenAI({ apiKey });

    try {
      const mp3Response = await openai.audio.speech.create({
        model: "tts-1",
        voice: args.voice as "alloy" | "shimmer" | "nova" | "echo" | "fable" | "onyx",
        input: args.input,
      });

      const arrayBuffer = await mp3Response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

export const generateThumbnailAction = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: args.prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = response.data?.[0]?.url;
    if (!url) throw new Error("No image URL returned");

    const imageResponse = await fetch(url);
    const buffer = await imageResponse.arrayBuffer();
    return buffer;
  },
});
