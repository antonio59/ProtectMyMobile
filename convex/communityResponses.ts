import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const hasVoted = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("communityResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    return !!existing;
  },
});

export const submit = mutation({
  args: {
    hadPhoneStolen: v.union(
      v.literal("yes"),
      v.literal("no"),
      v.literal("someone_i_know")
    ),
    phoneRecovered: v.optional(
      v.union(
        v.literal("yes_fully"),
        v.literal("partially"),
        v.literal("no"),
        v.literal("investigating")
      )
    ),
    replacementMethod: v.optional(
      v.union(
        v.literal("new_outright"),
        v.literal("second_hand"),
        v.literal("insurance"),
        v.literal("contract"),
        v.literal("not_yet"),
        v.literal("backup_phone")
      )
    ),
    theftLocation: v.optional(
      v.union(
        v.literal("public_transport"),
        v.literal("restaurant"),
        v.literal("street"),
        v.literal("event"),
        v.literal("shop"),
        v.literal("other")
      )
    ),
    securityMeasures: v.optional(v.array(v.string())),
    reportedToPolice: v.optional(
      v.union(
        v.literal("yes_crime_ref"),
        v.literal("yes_no_followup"),
        v.literal("no"),
        v.literal("network_only")
      )
    ),
    sessionId: v.string(),
    userIpHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already voted
    const existing = await ctx.db
      .query("communityResponses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      throw new Error("You have already submitted a response");
    }

    return await ctx.db.insert("communityResponses", args);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db.query("communityResponses").collect();

    const totalResponses = responses.length;
    const totalStolen = responses.filter((r) => r.hadPhoneStolen === "yes").length;
    const neverStolen = responses.filter((r) => r.hadPhoneStolen === "no").length;
    const someoneIKnow = responses.filter((r) => r.hadPhoneStolen === "someone_i_know").length;

    const stolenWithRecovery = responses.filter((r) => r.phoneRecovered);
    const recoveryStats = {
      fullyRecovered: stolenWithRecovery.filter((r) => r.phoneRecovered === "yes_fully").length,
      partiallyRecovered: stolenWithRecovery.filter((r) => r.phoneRecovered === "partially").length,
      notRecovered: stolenWithRecovery.filter((r) => r.phoneRecovered === "no").length,
      investigating: stolenWithRecovery.filter((r) => r.phoneRecovered === "investigating").length,
      recoveryRate: stolenWithRecovery.length
        ? Math.round(
            (stolenWithRecovery.filter((r) => r.phoneRecovered === "yes_fully").length /
              stolenWithRecovery.length) *
              100 *
              10
          ) / 10
        : 0,
    };

    const withLocation = responses.filter((r) => r.theftLocation);
    const locationStats = {
      publicTransport: withLocation.filter((r) => r.theftLocation === "public_transport").length,
      restaurant: withLocation.filter((r) => r.theftLocation === "restaurant").length,
      street: withLocation.filter((r) => r.theftLocation === "street").length,
      event: withLocation.filter((r) => r.theftLocation === "event").length,
      shop: withLocation.filter((r) => r.theftLocation === "shop").length,
      other: withLocation.filter((r) => r.theftLocation === "other").length,
    };

    const withReplacement = responses.filter((r) => r.replacementMethod);
    const replacementStats = {
      newOutright: withReplacement.filter((r) => r.replacementMethod === "new_outright").length,
      secondHand: withReplacement.filter((r) => r.replacementMethod === "second_hand").length,
      insurance: withReplacement.filter((r) => r.replacementMethod === "insurance").length,
      contract: withReplacement.filter((r) => r.replacementMethod === "contract").length,
      notYet: withReplacement.filter((r) => r.replacementMethod === "not_yet").length,
      backupPhone: withReplacement.filter((r) => r.replacementMethod === "backup_phone").length,
    };

    const withSecurity = responses.filter((r) => r.securityMeasures);
    const securityStats = {
      usingPin: withSecurity.filter((r) => r.securityMeasures?.includes("pin")).length,
      usingBiometric: withSecurity.filter((r) => r.securityMeasures?.includes("biometric")).length,
      usingFindMyDevice: withSecurity.filter((r) => r.securityMeasures?.includes("find_my_device")).length,
      usingSimPin: withSecurity.filter((r) => r.securityMeasures?.includes("sim_pin")).length,
      noSecurity: withSecurity.filter((r) => r.securityMeasures?.includes("none")).length,
    };

    const withPolice = responses.filter((r) => r.reportedToPolice);
    const policeStats = {
      yesCrimeRef: withPolice.filter((r) => r.reportedToPolice === "yes_crime_ref").length,
      yesNoFollowup: withPolice.filter((r) => r.reportedToPolice === "yes_no_followup").length,
      no: withPolice.filter((r) => r.reportedToPolice === "no").length,
      networkOnly: withPolice.filter((r) => r.reportedToPolice === "network_only").length,
      reportingRate: withPolice.length
        ? Math.round(
            (withPolice.filter((r) =>
              ["yes_crime_ref", "yes_no_followup"].includes(r.reportedToPolice!)
            ).length /
              withPolice.length) *
              100 *
              10
          ) / 10
        : 0,
    };

    return {
      totalResponses,
      totalStolen,
      neverStolen,
      someoneIKnow,
      recoveryStats,
      locationStats,
      replacementStats,
      securityStats,
      policeStats,
      lastUpdated: new Date().toISOString(),
    };
  },
});
