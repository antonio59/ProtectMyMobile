import { getTheftDataPoints } from './convexData';

export interface TimelapseDataPoint {
  id?: string;
  date: string; // YYYY-MM format
  borough: string;
  lat: number;
  lng: number;
  thefts: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all timelapse data from Convex
 */
export async function getTimelapseData(): Promise<TimelapseDataPoint[]> {
  const data = await getTheftDataPoints();
  
  // Map Convex data to TimelapseDataPoint format
  return data.map(point => ({
    id: point._id,
    date: point.date,
    borough: point.locationName,
    lat: point.latitude,
    lng: point.longitude,
    thefts: point.theftCount,
  }));
}

/**
 * Upload timelapse data (admin only) - Now handled by Convex mutations
 */
export async function uploadTimelapseData(_data: TimelapseDataPoint[]) {
  console.warn('Use Convex mutations for uploading timelapse data');
  throw new Error('Use Convex mutations for uploading timelapse data');
}

/**
 * Delete timelapse data by date range (admin only) - Now handled by Convex mutations
 */
export async function deleteTimelapseData(_startDate: string, _endDate: string) {
  console.warn('Use Convex mutations for deleting timelapse data');
  throw new Error('Use Convex mutations for deleting timelapse data');
}

// London borough coordinates reference
export const BOROUGH_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Westminster': { lat: 51.4975, lng: -0.1357 },
  'Camden': { lat: 51.5290, lng: -0.1255 },
  'Islington': { lat: 51.5416, lng: -0.1022 },
  'Kensington and Chelsea': { lat: 51.4991, lng: -0.1938 },
  'Southwark': { lat: 51.5030, lng: -0.0900 },
  'Lambeth': { lat: 51.4570, lng: -0.1231 },
  'Hackney': { lat: 51.5450, lng: -0.0553 },
  'Tower Hamlets': { lat: 51.5099, lng: -0.0059 },
  'Newham': { lat: 51.5255, lng: 0.0352 },
  'Hammersmith and Fulham': { lat: 51.4927, lng: -0.2339 },
  'Barnet': { lat: 51.6252, lng: -0.1517 },
  'Brent': { lat: 51.5673, lng: -0.2711 },
  'Croydon': { lat: 51.3714, lng: -0.0977 },
  'Greenwich': { lat: 51.4892, lng: 0.0648 },
  'Lewisham': { lat: 51.4415, lng: -0.0117 },
  'Wandsworth': { lat: 51.4571, lng: -0.1909 },
  'Barking and Dagenham': { lat: 51.5464, lng: 0.1293 },
  'Bexley': { lat: 51.4549, lng: 0.1505 },
  'Bromley': { lat: 51.4039, lng: 0.0198 },
  'Ealing': { lat: 51.5130, lng: -0.3089 },
  'Enfield': { lat: 51.6538, lng: -0.0799 },
  'Haringey': { lat: 51.6000, lng: -0.1119 },
  'Harrow': { lat: 51.5898, lng: -0.3346 },
  'Havering': { lat: 51.5812, lng: 0.2210 },
  'Hillingdon': { lat: 51.5441, lng: -0.4760 },
  'Hounslow': { lat: 51.4746, lng: -0.3580 },
  'Kingston upon Thames': { lat: 51.4085, lng: -0.3064 },
  'Merton': { lat: 51.4098, lng: -0.2108 },
  'Redbridge': { lat: 51.5590, lng: 0.0741 },
  'Richmond upon Thames': { lat: 51.4613, lng: -0.3037 },
  'Sutton': { lat: 51.3618, lng: -0.1945 },
  'Waltham Forest': { lat: 51.5908, lng: -0.0134 },
};
