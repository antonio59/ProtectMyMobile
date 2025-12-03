import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a metadata value by key
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const metadata = await ctx.db
      .query("siteMetadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return metadata;
  },
});

// Get multiple metadata values
export const getMultiple = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results: Record<string, { value: string; updatedAt: number } | null> = {};
    
    for (const key of args.keys) {
      const metadata = await ctx.db
        .query("siteMetadata")
        .withIndex("by_key", (q) => q.eq("key", key))
        .first();
      results[key] = metadata ? { value: metadata.value, updatedAt: metadata.updatedAt } : null;
    }
    
    return results;
  },
});

// Set a metadata value (upsert)
export const set = mutation({
  args: { 
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteMetadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("siteMetadata", {
        key: args.key,
        value: args.value,
        updatedAt: now,
      });
    }
  },
});

// Update directory verification timestamps
export const updateDirectoryVerified = mutation({
  args: { 
    directory: v.union(v.literal("banks"), v.literal("mobileProviders")),
  },
  handler: async (ctx, args) => {
    const key = `${args.directory}_last_verified`;
    const now = Date.now();
    
    const existing = await ctx.db
      .query("siteMetadata")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: now.toString(),
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("siteMetadata", {
        key,
        value: now.toString(),
        updatedAt: now,
      });
    }
    
    return now;
  },
});
