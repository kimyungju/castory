import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const createPodcast = mutation({
  args: {
    podcastTitle: v.string(),
    podcastDescription: v.string(),
    audioUrl: v.string(),
    imageUrl: v.string(),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    audioStorageId: v.id("_storage"),
    imageStorageId: v.id("_storage"),
    views: v.number(),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Get the user from the database
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // User hasn't been synced via webhook yet — create from auth identity
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email ?? `${identity.subject}@clerk.user`,
        name: identity.name ?? identity.email?.split("@")[0] ?? "Unknown",
        imageUrl: identity.pictureUrl ?? "",
      });
      user = await ctx.db.get(userId);
      if (!user) {
        throw new ConvexError("Failed to create user");
      }
    }

    // Insert the podcast
    const podcastId = await ctx.db.insert("podcasts", {
      audioStorageId: args.audioStorageId,
      user: user._id,
      podcastTitle: args.podcastTitle,
      podcastDescription: args.podcastDescription,
      audioUrl: args.audioUrl,
      imageUrl: args.imageUrl,
      imageStorageId: args.imageStorageId,
      author: user.name,
      authorId: user.clerkId,
      authorImageUrl: user.imageUrl,
      voicePrompt: args.voicePrompt,
      imagePrompt: args.imagePrompt,
      voiceType: args.voiceType,
      audioDuration: args.audioDuration,
      views: args.views,
    });

    return podcastId;
  },
});

export const getTrendingPodcasts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").collect();
  },
});

export const getPodcastById = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.podcastId);
  },
});

export const getPodcastByVoiceType = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);
    return await ctx.db
      .query("podcasts")
      .filter((q) =>
        q.and(
          q.eq(q.field("voiceType"), podcast?.voiceType),
          q.neq(q.field("_id"), args.podcastId)
        )
      )
      .collect();
  },
});

export const updatePodcastViews = mutation({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) throw new ConvexError("Podcast not found");
    return await ctx.db.patch(args.podcastId, { views: podcast.views + 1 });
  },
});

export const getPodcastBySearch = query({
  args: { search: v.string() },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("podcasts").order("desc").collect();
    }
    return await ctx.db
      .query("podcasts")
      .withSearchIndex("search_title", (q) =>
        q.search("podcastTitle", args.search)
      )
      .collect();
  },
});

export const getPodcastByAuthorId = query({
  args: { authorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_authorId", (q) => q.eq("authorId", args.authorId))
      .collect();
  },
});

export const deletePodcast = mutation({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const podcast = await ctx.db.get(args.podcastId);
    if (!podcast) {
      throw new ConvexError("Podcast not found");
    }

    if (podcast.authorId !== identity.subject) {
      throw new ConvexError("Not authorized to delete this podcast");
    }

    try {
      if (podcast.audioStorageId) {
        await ctx.storage.delete(podcast.audioStorageId);
      }
    } catch {
      // Storage file may already be deleted; continue
    }
    try {
      if (podcast.imageStorageId) {
        await ctx.storage.delete(podcast.imageStorageId);
      }
    } catch {
      // Storage file may already be deleted; continue
    }

    return await ctx.db.delete(args.podcastId);
  },
});

export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});
