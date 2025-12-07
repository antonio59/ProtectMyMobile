import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: { 
    activeOnly: v.optional(v.boolean()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("policeForces")
        .withIndex("by_active", (q) => q.eq("active", true))
        .collect();
    }
    if (args.region) {
      return await ctx.db
        .query("policeForces")
        .withIndex("by_region", (q) => q.eq("region", args.region as any))
        .collect();
    }
    return await ctx.db.query("policeForces").collect();
  },
});

export const getByShortCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    const forces = await ctx.db.query("policeForces").collect();
    return forces.find(f => f.shortCode === args.shortCode);
  },
});

export const create = mutation({
  args: {
    adminToken: v.optional(v.string()),
    name: v.string(),
    shortCode: v.string(),
    foiEmail: v.string(),
    region: v.union(
      v.literal("england"),
      v.literal("wales"),
      v.literal("scotland"),
      v.literal("northern_ireland"),
      v.literal("national")
    ),
    website: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { adminToken, ...rest } = args;
    return await ctx.db.insert("policeForces", rest);
  },
});

export const update = mutation({
  args: {
    adminToken: v.optional(v.string()),
    id: v.id("policeForces"),
    name: v.optional(v.string()),
    foiEmail: v.optional(v.string()),
    website: v.optional(v.string()),
    active: v.optional(v.boolean()),
    lastRequestDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const { id, adminToken, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const seedUKForces = mutation({
  args: { adminToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAdmin(ctx, args.adminToken);
    const existing = await ctx.db.query("policeForces").collect();
    if (existing.length > 0) {
      return { message: "Police forces already seeded", count: existing.length };
    }

    const forces = [
      // England - Major Forces
      { name: "Metropolitan Police Service", shortCode: "met", foiEmail: "foi@met.police.uk", region: "england" as const, website: "https://www.met.police.uk", active: true },
      { name: "Greater Manchester Police", shortCode: "gmp", foiEmail: "foi@gmp.police.uk", region: "england" as const, website: "https://www.gmp.police.uk", active: true },
      { name: "West Midlands Police", shortCode: "wmp", foiEmail: "foi@west-midlands.police.uk", region: "england" as const, website: "https://www.west-midlands.police.uk", active: true },
      { name: "West Yorkshire Police", shortCode: "wyp", foiEmail: "foi@westyorkshire.police.uk", region: "england" as const, website: "https://www.westyorkshire.police.uk", active: true },
      { name: "Merseyside Police", shortCode: "merseyside", foiEmail: "foi@merseyside.police.uk", region: "england" as const, website: "https://www.merseyside.police.uk", active: true },
      { name: "South Yorkshire Police", shortCode: "syp", foiEmail: "foi@southyorks.police.uk", region: "england" as const, website: "https://www.southyorkshire.police.uk", active: true },
      { name: "Northumbria Police", shortCode: "northumbria", foiEmail: "foi@northumbria.police.uk", region: "england" as const, website: "https://www.northumbria.police.uk", active: true },
      { name: "Thames Valley Police", shortCode: "tvp", foiEmail: "foi@thamesvalley.police.uk", region: "england" as const, website: "https://www.thamesvalley.police.uk", active: true },
      { name: "Hampshire Constabulary", shortCode: "hampshire", foiEmail: "foi@hampshire.police.uk", region: "england" as const, website: "https://www.hampshire.police.uk", active: true },
      { name: "Kent Police", shortCode: "kent", foiEmail: "foi@kent.police.uk", region: "england" as const, website: "https://www.kent.police.uk", active: true },
      { name: "Essex Police", shortCode: "essex", foiEmail: "foi@essex.police.uk", region: "england" as const, website: "https://www.essex.police.uk", active: true },
      { name: "Lancashire Constabulary", shortCode: "lancashire", foiEmail: "foi@lancashire.police.uk", region: "england" as const, website: "https://www.lancashire.police.uk", active: true },
      { name: "Sussex Police", shortCode: "sussex", foiEmail: "foi@sussex.police.uk", region: "england" as const, website: "https://www.sussex.police.uk", active: true },
      { name: "Avon and Somerset Police", shortCode: "avon", foiEmail: "foi@avonandsomerset.police.uk", region: "england" as const, website: "https://www.avonandsomerset.police.uk", active: true },
      { name: "Devon and Cornwall Police", shortCode: "devon", foiEmail: "foi@devonandcornwall.police.uk", region: "england" as const, website: "https://www.devon-cornwall.police.uk", active: true },
      { name: "Nottinghamshire Police", shortCode: "notts", foiEmail: "foi@nottinghamshire.police.uk", region: "england" as const, website: "https://www.nottinghamshire.police.uk", active: true },
      { name: "Leicestershire Police", shortCode: "leics", foiEmail: "foi@leicestershire.police.uk", region: "england" as const, website: "https://www.leics.police.uk", active: true },
      { name: "City of London Police", shortCode: "colp", foiEmail: "foi@cityoflondon.police.uk", region: "england" as const, website: "https://www.cityoflondon.police.uk", active: true },
      
      // Wales
      { name: "South Wales Police", shortCode: "swales", foiEmail: "foi@south-wales.police.uk", region: "wales" as const, website: "https://www.south-wales.police.uk", active: true },
      { name: "North Wales Police", shortCode: "nwales", foiEmail: "foi@north-wales.police.uk", region: "wales" as const, website: "https://www.north-wales.police.uk", active: true },
      { name: "Dyfed-Powys Police", shortCode: "dyfed", foiEmail: "foi@dyfed-powys.police.uk", region: "wales" as const, website: "https://www.dyfed-powys.police.uk", active: true },
      { name: "Gwent Police", shortCode: "gwent", foiEmail: "foi@gwent.police.uk", region: "wales" as const, website: "https://www.gwent.police.uk", active: true },
      
      // Scotland
      { name: "Police Scotland", shortCode: "scotland", foiEmail: "foi@scotland.police.uk", region: "scotland" as const, website: "https://www.scotland.police.uk", active: true },
      
      // Northern Ireland
      { name: "Police Service of Northern Ireland", shortCode: "psni", foiEmail: "foi@psni.police.uk", region: "northern_ireland" as const, website: "https://www.psni.police.uk", active: true },
      
      // National
      { name: "British Transport Police", shortCode: "btp", foiEmail: "foi@btp.police.uk", region: "national" as const, website: "https://www.btp.police.uk", active: true },
      { name: "National Crime Agency", shortCode: "nca", foiEmail: "foi@nca.gov.uk", region: "national" as const, website: "https://www.nationalcrimeagency.gov.uk", active: true },
    ];

    for (const force of forces) {
      await ctx.db.insert("policeForces", force);
    }

    return { message: "Seeded UK police forces", count: forces.length };
  },
});
