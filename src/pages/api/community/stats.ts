// API Endpoint: GET /api/community/stats
// Returns community analytics statistics

import type { APIRoute } from 'astro';
import { getCommunityStats } from '../../../lib/convexData';

export const GET: APIRoute = async () => {
  try {
    const stats = await getCommunityStats();
    
    if (!stats) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch community statistics' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
