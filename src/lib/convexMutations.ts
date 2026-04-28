// Convex Mutation Functions - Client-side mutations
// Used by React components and API routes

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convexUrl = typeof window !== 'undefined' 
  ? (import.meta.env?.PUBLIC_CONVEX_URL || (window as any).__CONVEX_URL__)
  : import.meta.env.PUBLIC_CONVEX_URL;

function getConvexClient() {
  if (!convexUrl) {
    console.warn('Convex URL not available');
    return null;
  }
  return new ConvexHttpClient(convexUrl);
}

// Contact Submissions
export async function createContactSubmission(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const client = getConvexClient();
  if (!client) throw new Error('Convex client not initialized');
  return await client.mutation(api.contactSubmissions.create, data);
}

// Experience Reports
async function createExperienceReport(data: {
  hasExperiencedTheft: boolean;
  when: string;
  where: string;
  whatHappened: string;
  doingDifferently?: string;
  name: string;
  email: string;
}) {
  const client = getConvexClient();
  if (!client) throw new Error('Convex client not initialized');
  return await client.mutation(api.experienceReports.create, data);
}

// Community Responses
export async function submitCommunityResponse(data: {
  hadPhoneStolen: 'yes' | 'no' | 'someone_i_know';
  phoneRecovered?: 'yes_fully' | 'partially' | 'no' | 'investigating';
  replacementMethod?: 'new_outright' | 'second_hand' | 'insurance' | 'contract' | 'not_yet' | 'backup_phone';
  theftLocation?: 'public_transport' | 'restaurant' | 'street' | 'event' | 'shop' | 'other';
  securityMeasures?: string[];
  reportedToPolice?: 'yes_crime_ref' | 'yes_no_followup' | 'no' | 'network_only';
  sessionId: string;
  userIpHash?: string;
  userAgent?: string;
}) {
  const client = getConvexClient();
  if (!client) throw new Error('Convex client not initialized');
  return await client.mutation(api.communityResponses.submit, data);
}

// Page Views
async function recordPageView(data: {
  path: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
}) {
  const client = getConvexClient();
  if (!client) return;
  return await client.mutation(api.pageViews.record, data);
}

// Helper functions from original communityData.ts
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'pmp_community_session';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

export async function hashIP(ip: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return '';
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
