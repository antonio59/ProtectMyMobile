/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminActionHistory from "../adminActionHistory.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as banks from "../banks.js";
import type * as communityResponses from "../communityResponses.js";
import type * as contactSubmissions from "../contactSubmissions.js";
import type * as experienceReports from "../experienceReports.js";
import type * as foiRequests from "../foiRequests.js";
import type * as importLogs from "../importLogs.js";
import type * as lib_crud from "../lib/crud.js";
import type * as lib_newsDedup from "../lib/newsDedup.js";
import type * as mobileProviders from "../mobileProviders.js";
import type * as newsPosts from "../newsPosts.js";
import type * as pageViews from "../pageViews.js";
import type * as policeForces from "../policeForces.js";
import type * as siteMetadata from "../siteMetadata.js";
import type * as theftDataPoints from "../theftDataPoints.js";
import type * as theftReports from "../theftReports.js";
import type * as wdtkEntries from "../wdtkEntries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminActionHistory: typeof adminActionHistory;
  analytics: typeof analytics;
  auth: typeof auth;
  banks: typeof banks;
  communityResponses: typeof communityResponses;
  contactSubmissions: typeof contactSubmissions;
  experienceReports: typeof experienceReports;
  foiRequests: typeof foiRequests;
  importLogs: typeof importLogs;
  "lib/crud": typeof lib_crud;
  "lib/newsDedup": typeof lib_newsDedup;
  mobileProviders: typeof mobileProviders;
  newsPosts: typeof newsPosts;
  pageViews: typeof pageViews;
  policeForces: typeof policeForces;
  siteMetadata: typeof siteMetadata;
  theftDataPoints: typeof theftDataPoints;
  theftReports: typeof theftReports;
  wdtkEntries: typeof wdtkEntries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
