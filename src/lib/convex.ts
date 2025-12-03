import { ConvexClient } from "convex/browser";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn('Convex URL not found. Database features will not work.');
}

export const convex = convexUrl ? new ConvexClient(convexUrl) : null;

// Type definitions matching the Convex schema
export interface NewsPost {
  _id: string;
  _creationTime: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorId?: string;
  authorName: string;
  category: 'arrest' | 'seizure' | 'law_change' | 'statistics' | 'prevention_tip' | 'other';
  sourceUrl?: string;
  sourceName?: string;
  featuredImageUrl?: string;
  published: boolean;
  publishedAt?: number;
  updatedAt: number;
}

export interface TheftDataPoint {
  _id: string;
  _creationTime: number;
  date: string;
  locationName: string;
  latitude: number;
  longitude: number;
  theftCount: number;
  dataSource: string;
}

export interface MetPoliceRequest {
  _id: string;
  _creationTime: number;
  requestDate: number;
  requestType: 'foi_request' | 'data_update' | 'statistics';
  dateRangeStart: string;
  dateRangeEnd: string;
  status: 'pending' | 'submitted' | 'received' | 'processed';
  requestDetails?: string;
  responseReceivedAt?: number;
  responseNotes?: string;
  createdBy?: string;
}

export interface ExperienceReport {
  _id: string;
  _creationTime: number;
  hasExperiencedTheft: boolean;
  when: string;
  where: string;
  whatHappened: string;
  doingDifferently?: string;
  name: string;
  email: string;
  approved: boolean;
  approvedAt?: number;
}

export interface ContactSubmission {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  responded: boolean;
  responseMessage?: string;
  respondedAt?: number;
}

export interface AdminAction {
  _id: string;
  _creationTime: number;
  adminId: string;
  adminUsername: string;
  actionType: 'approve_experience' | 'unapprove_experience' | 'respond_contact' | 'mark_spam';
  targetId: string;
  metadata?: string;
}

export interface CommunityResponse {
  _id: string;
  _creationTime: number;
  hadPhoneStolen: 'yes' | 'no' | 'someone_i_know';
  phoneRecovered?: 'yes_fully' | 'partially' | 'no' | 'investigating';
  replacementMethod?: 'new_outright' | 'second_hand' | 'insurance' | 'contract' | 'not_yet' | 'backup_phone';
  theftLocation?: 'public_transport' | 'restaurant' | 'street' | 'event' | 'shop' | 'other';
  securityMeasures?: string[];
  reportedToPolice?: 'yes_crime_ref' | 'yes_no_followup' | 'no' | 'network_only';
  sessionId: string;
  userIpHash?: string;
  userAgent?: string;
}

export interface Bank {
  _id: string;
  _creationTime: number;
  name: string;
  phone?: string;
  website: string;
  fraudContact?: string;
  category: 'high_street' | 'online' | 'building_society' | 'challenger';
  logoUrl?: string;
  active: boolean;
  lastVerified?: number;
}

export interface MobileProvider {
  _id: string;
  _creationTime: number;
  name: string;
  phone?: string;
  website: string;
  theftContact?: string;
  network: 'EE' | 'Vodafone' | 'O2' | 'Three' | 'MVNO';
  isMvno: boolean;
  parentNetwork?: string;
  active: boolean;
  lastVerified?: number;
}

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
