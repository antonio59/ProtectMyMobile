import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Site Metadata (for tracking last verified dates, etc.)
  siteMetadata: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Experience Reports
  experienceReports: defineTable({
    hasExperiencedTheft: v.boolean(),
    when: v.string(),
    where: v.string(),
    whatHappened: v.string(),
    doingDifferently: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    approved: v.boolean(),
    approvedAt: v.optional(v.number()),
  }).index("by_approved", ["approved"]),

  // Contact Submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    responded: v.boolean(),
    responseMessage: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
  }).index("by_responded", ["responded"]),

  // Admin Action History
  adminActionHistory: defineTable({
    adminId: v.string(),
    adminUsername: v.string(),
    actionType: v.union(
      v.literal("approve_experience"),
      v.literal("unapprove_experience"),
      v.literal("respond_contact"),
      v.literal("mark_spam"),
    ),
    targetId: v.string(),
    metadata: v.optional(v.string()),
  }).index("by_admin", ["adminId"]),

  // News Posts
  newsPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    category: v.union(
      v.literal("arrest"),
      v.literal("seizure"),
      v.literal("law_change"),
      v.literal("statistics"),
      v.literal("prevention_tip"),
      v.literal("other"),
    ),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    featuredImageUrl: v.optional(v.string()),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published", "publishedAt"])
    .index("by_category", ["category"]),

  // Theft Data Points (for timelapse)
  theftDataPoints: defineTable({
    date: v.string(),
    locationName: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    theftCount: v.number(),
    dataSource: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_location", ["locationName"])
    .index("by_date_location_source", ["date", "locationName", "dataSource"]),

  // FOI Requests to Police Forces
  foiRequests: defineTable({
    // Request details
    referenceNumber: v.string(),
    policeForce: v.string(),
    policeForceEmail: v.string(),
    requestDate: v.number(),
    dateRangeStart: v.string(),
    dateRangeEnd: v.string(),

    // Status tracking
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("acknowledged"),
      v.literal("extended"),
      v.literal("received"),
      v.literal("processed"),
      v.literal("rejected"),
      v.literal("overdue"),
    ),

    // Response tracking
    dueDate: v.number(),
    acknowledgedAt: v.optional(v.number()),
    responseReceivedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),

    // Content
    requestBody: v.string(),
    responseNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),

    // Data file tracking
    responseFileUrl: v.optional(v.string()),
    responseFileName: v.optional(v.string()),
    recordsImported: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_police_force", ["policeForce"])
    .index("by_due_date", ["dueDate"]),

  // Police Forces directory
  policeForces: defineTable({
    name: v.string(),
    shortCode: v.string(),
    foiEmail: v.string(),
    region: v.union(
      v.literal("england"),
      v.literal("wales"),
      v.literal("scotland"),
      v.literal("northern_ireland"),
      v.literal("national"),
    ),
    website: v.optional(v.string()),
    active: v.boolean(),
    lastRequestDate: v.optional(v.number()),
  })
    .index("by_region", ["region"])
    .index("by_active", ["active"]),

  // WhatDoTheyKnow FOI entries (scraped)
  wdtkEntries: defineTable({
    wdtkId: v.string(),
    title: v.string(),
    url: v.string(),
    publishedAt: v.number(),
    policeForce: v.optional(v.string()),
    status: v.union(
      v.literal("successful"),
      v.literal("partial"),
      v.literal("refused"),
      v.literal("awaiting"),
      v.literal("classification"),
      v.literal("unknown"),
    ),
    hasData: v.boolean(),
    dataImported: v.boolean(),
    importedAt: v.optional(v.number()),
    recordsImported: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_wdtk_id", ["wdtkId"])
    .index("by_status", ["status"])
    .index("by_has_data", ["hasData"])
    .index("by_imported", ["dataImported"]),

  // Community Responses
  communityResponses: defineTable({
    hadPhoneStolen: v.union(
      v.literal("yes"),
      v.literal("no"),
      v.literal("someone_i_know"),
    ),
    phoneRecovered: v.optional(
      v.union(
        v.literal("yes_fully"),
        v.literal("partially"),
        v.literal("no"),
        v.literal("investigating"),
      ),
    ),
    replacementMethod: v.optional(
      v.union(
        v.literal("new_outright"),
        v.literal("second_hand"),
        v.literal("insurance"),
        v.literal("contract"),
        v.literal("not_yet"),
        v.literal("backup_phone"),
      ),
    ),
    theftLocation: v.optional(
      v.union(
        v.literal("public_transport"),
        v.literal("restaurant"),
        v.literal("street"),
        v.literal("event"),
        v.literal("shop"),
        v.literal("other"),
      ),
    ),
    securityMeasures: v.optional(v.array(v.string())),
    reportedToPolice: v.optional(
      v.union(
        v.literal("yes_crime_ref"),
        v.literal("yes_no_followup"),
        v.literal("no"),
        v.literal("network_only"),
      ),
    ),
    sessionId: v.string(),
    userIpHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  }).index("by_session", ["sessionId"]),

  // Page Views (analytics)
  pageViews: defineTable({
    path: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
  }).index("by_path", ["path"]),

  // Banks
  banks: defineTable({
    name: v.string(),
    phone: v.optional(v.string()),
    website: v.string(),
    fraudContact: v.optional(v.string()),
    category: v.union(
      v.literal("high_street"),
      v.literal("online"),
      v.literal("building_society"),
      v.literal("challenger"),
    ),
    logoUrl: v.optional(v.string()),
    active: v.boolean(),
    lastVerified: v.optional(v.number()),
  })
    .index("by_active", ["active"])
    .index("by_category", ["category"]),

  // Mobile Providers
  mobileProviders: defineTable({
    name: v.string(),
    phone: v.optional(v.string()),
    website: v.string(),
    theftContact: v.optional(v.string()),
    network: v.union(
      v.literal("EE"),
      v.literal("Vodafone"),
      v.literal("O2"),
      v.literal("Three"),
      v.literal("MVNO"),
    ),
    isMvno: v.boolean(),
    parentNetwork: v.optional(v.string()),
    active: v.boolean(),
    lastVerified: v.optional(v.number()),
  })
    .index("by_active", ["active"])
    .index("by_network", ["network"]),

  // Import Logs (tracking data imports from various sources)
  importLogs: defineTable({
    timestamp: v.number(),
    source: v.string(), // 'police.uk', 'wdtk', 'news', 'manual-csv', 'seed'
    status: v.union(
      v.literal("started"),
      v.literal("success"),
      v.literal("partial"),
      v.literal("failed"),
    ),
    recordsProcessed: v.optional(v.number()),
    recordsCreated: v.optional(v.number()),
    recordsSkipped: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    details: v.optional(v.string()),
    duration: v.optional(v.number()), // milliseconds
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_source", ["source"])
    .index("by_status", ["status"]),
});
