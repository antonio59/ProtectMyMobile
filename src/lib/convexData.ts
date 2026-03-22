// Convex Data Functions - Server-side data fetching
// Used by Astro pages for SSR

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

export const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;

// News Posts
export async function getNewsPosts(publishedOnly = true) {
  if (!convexClient) {
    console.warn('Convex client not initialized');
    return [];
  }
  return await convexClient.query(api.newsPosts.list, { publishedOnly });
}

export async function getNewsPostBySlug(slug: string) {
  if (!convexClient) return null;
  return await convexClient.query(api.newsPosts.getBySlug, { slug });
}

// Theft Data Points
export async function getTheftDataPoints(startDate?: string, endDate?: string) {
  if (!convexClient) return [];
  return await convexClient.query(api.theftDataPoints.list, { startDate, endDate });
}

// Banks
export async function getBanks(activeOnly = true) {
  if (!convexClient) return [];
  return await convexClient.query(api.banks.list, { activeOnly });
}

// Mobile Providers
export async function getMobileProviders(activeOnly = true) {
  if (!convexClient) return [];
  return await convexClient.query(api.mobileProviders.list, { activeOnly });
}

// Experience Reports
export async function getExperienceReports(approvedOnly = false) {
  if (!convexClient) return [];
  return await convexClient.query(api.experienceReports.list, { approvedOnly });
}

// Contact Submissions (admin only)
export async function getContactSubmissions() {
  if (!convexClient) return [];
  return await convexClient.query(api.contactSubmissions.list, {});
}

// Community Stats
export async function getCommunityStats() {
  if (!convexClient) return null;
  return await convexClient.query(api.communityResponses.getStats, {});
}

// Check if session has voted
export async function checkHasVoted(sessionId: string) {
  if (!convexClient) return false;
  return await convexClient.query(api.communityResponses.hasVoted, { sessionId });
}

// Monthly Trends for charts
export async function getMonthlyTrends(topN?: number, startYear?: string, endYear?: string) {
  if (!convexClient) return { months: [], locations: [], data: [] };
  return await convexClient.query(api.theftDataPoints.getMonthlyTrends, { topN, startYear, endYear });
}

// Theft stats summary
export async function getTheftStats(year?: string) {
  if (!convexClient) return null;
  return await convexClient.query(api.theftDataPoints.getStats, { year });
}

// Get site metadata
export async function getSiteMetadata(key: string) {
  if (!convexClient) return null;
  return await convexClient.query(api.siteMetadata.get, { key });
}

// Get multiple site metadata values
export async function getMultipleSiteMetadata(keys: string[]) {
  if (!convexClient) return {};
  return await convexClient.query(api.siteMetadata.getMultiple, { keys });
}

// Get directory last verified dates
export async function getDirectoryLastVerified() {
  if (!convexClient) return { banks: null, mobileProviders: null };
  
  const metadata = await convexClient.query(api.siteMetadata.getMultiple, { 
    keys: ['banks_last_verified', 'mobileProviders_last_verified'] 
  });
  
  return {
    banks: metadata['banks_last_verified']?.updatedAt || null,
    mobileProviders: metadata['mobileProviders_last_verified']?.updatedAt || null,
  };
}

// Community Stats type (re-export for components)
export interface CommunityStats {
  totalResponses: number;
  totalStolen: number;
  neverStolen: number;
  someoneIKnow: number;
  
  recoveryStats: {
    fullyRecovered: number;
    partiallyRecovered: number;
    notRecovered: number;
    investigating: number;
    recoveryRate: number;
  };
  
  locationStats: {
    publicTransport: number;
    restaurant: number;
    street: number;
    event: number;
    shop: number;
    other: number;
  };
  
  replacementStats: {
    newOutright: number;
    secondHand: number;
    insurance: number;
    contract: number;
    notYet: number;
    backupPhone: number;
  };
  
  securityStats: {
    usingPin: number;
    usingBiometric: number;
    usingFindMyDevice: number;
    usingSimPin: number;
    noSecurity: number;
  };
  
  policeStats: {
    yesCrimeRef: number;
    yesNoFollowup: number;
    no: number;
    networkOnly: number;
    reportingRate: number;
  };
  
  lastUpdated: string;
}

// Community Response type
export interface CommunityResponse {
  had_phone_stolen?: 'yes' | 'no' | 'someone_i_know';
  hadPhoneStolen?: 'yes' | 'no' | 'someone_i_know';
  phone_recovered?: 'yes_fully' | 'partially' | 'no' | 'investigating' | null;
  phoneRecovered?: 'yes_fully' | 'partially' | 'no' | 'investigating' | null;
  replacement_method?: 'new_outright' | 'second_hand' | 'insurance' | 'contract' | 'not_yet' | 'backup_phone' | null;
  replacementMethod?: 'new_outright' | 'second_hand' | 'insurance' | 'contract' | 'not_yet' | 'backup_phone' | null;
  theft_location?: 'public_transport' | 'restaurant' | 'street' | 'event' | 'shop' | 'other' | null;
  theftLocation?: 'public_transport' | 'restaurant' | 'street' | 'event' | 'shop' | 'other' | null;
  security_measures?: string[];
  securityMeasures?: string[];
  reported_to_police?: 'yes_crime_ref' | 'yes_no_followup' | 'no' | 'network_only' | null;
  reportedToPolice?: 'yes_crime_ref' | 'yes_no_followup' | 'no' | 'network_only' | null;
  session_id?: string;
  sessionId?: string;
}

// Helper functions for community insights
export function getMostCommonLocation(stats: CommunityStats): string {
  const locations = stats.locationStats;
  const max = Math.max(
    locations.publicTransport,
    locations.restaurant,
    locations.street,
    locations.event,
    locations.shop,
    locations.other
  );
  
  if (max === locations.publicTransport) return 'Public Transport';
  if (max === locations.street) return 'Street';
  if (max === locations.restaurant) return 'Restaurant/Café';
  if (max === locations.event) return 'Event/Venue';
  if (max === locations.shop) return 'Shop/Mall';
  return 'Other';
}

export function getSecurityAdoptionRate(stats: CommunityStats): number {
  const total = stats.totalResponses;
  if (total === 0) return 0;
  const withSecurity = total - stats.securityStats.noSecurity;
  return Math.round((withSecurity / total) * 100);
}

export function generateInsights(
  userResponse: CommunityResponse,
  stats: CommunityStats
): string[] {
  const insights: string[] = [];
  const hadStolen = userResponse.had_phone_stolen || userResponse.hadPhoneStolen;
  const phoneRecovered = userResponse.phone_recovered || userResponse.phoneRecovered;
  const securityMeasures = userResponse.security_measures || userResponse.securityMeasures || [];
  const theftLocation = userResponse.theft_location || userResponse.theftLocation;
  const reportedToPolice = userResponse.reported_to_police || userResponse.reportedToPolice;
  
  if (hadStolen === 'yes') {
    if (phoneRecovered === 'no') {
      const totalWithRecovery = stats.recoveryStats.fullyRecovered + stats.recoveryStats.partiallyRecovered + stats.recoveryStats.notRecovered;
      if (totalWithRecovery > 0) {
        const notRecoveredPercent = Math.round((stats.recoveryStats.notRecovered / totalWithRecovery) * 100);
        insights.push(`${notRecoveredPercent}% of theft victims in our community also never recovered their phone.`);
      }
    }
    
    if (securityMeasures.includes('find_my_device')) {
      insights.push('Find My Device significantly increases recovery chances. Keep it enabled!');
    } else {
      insights.push('Consider enabling Find My Device - users with this feature have higher recovery rates.');
    }
    
    if (theftLocation === 'public_transport') {
      insights.push('Public transport is the most common theft location in our data. Stay extra vigilant on buses and trains.');
    }
    
    if (reportedToPolice === 'yes_crime_ref') {
      insights.push('Good! Reporting to police creates official records that may help with insurance claims.');
    } else if (reportedToPolice === 'no') {
      insights.push('Consider reporting to police even if recovery seems unlikely - it helps track crime patterns.');
    }
  } else {
    if (securityMeasures.includes('biometric') && securityMeasures.includes('find_my_device')) {
      insights.push('Excellent security setup! You\'re well-protected against theft.');
    } else {
      insights.push('Consider adding more security layers like biometric locks and Find My Device.');
    }
  }
  
  return insights;
}
