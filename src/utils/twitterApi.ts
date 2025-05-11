import axios from 'axios';
import { Tweet, TrendPoint } from '../types';

// API proxy server URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface TwitterCountResponse {
  data: {
    end: string;
    start: string;
    tweet_count: number;
  }[];
  meta: {
    total_tweet_count: number;
    next_token?: string;
  };
}

interface SearchOptions {
  startTime?: string;
  endTime?: string;
  nextToken?: string;
  granularity?: 'minute' | 'hour' | 'day';
}

// Cache to store recent search results
const searchCache: Record<string, { timestamp: number; data: TrendPoint[]; nextToken?: string }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get date 7 days ago in ISO format
function getSevenDaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

// Function to fetch all pages of results
async function fetchAllPages(keywords: string[], options: SearchOptions = {}): Promise<TrendPoint[]> {
  let allPoints: TrendPoint[] = [];
  let currentOptions = {
    ...options,
    startTime: options.startTime || getSevenDaysAgo(),
    granularity: options.granularity || 'hour'
  };
  
  while (true) {
    const { points, nextToken } = await searchTweetCounts(keywords, currentOptions);
    allPoints = [...allPoints, ...points];
    
    if (!nextToken) break;
    currentOptions.nextToken = nextToken;
  }
  
  return allPoints;
}

export async function searchTweetCounts(keywords: string[], options: SearchOptions = {}): Promise<{ points: TrendPoint[]; nextToken?: string }> {
  try {
    console.log("Searching for tweet counts with keywords:", keywords);
    
    // Create a cache key based on the search parameters
    const cacheKey = JSON.stringify({ keywords, options });
    
    // Check cache first
    const cached = searchCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log("Using cached results");
      return { points: cached.data, nextToken: cached.nextToken };
    }
    
    // Set up the request to our proxy server
    const response = await api.post<TwitterCountResponse>(`${API_BASE_URL}/search/counts`, {
      keywords,
      startTime: options.startTime || getSevenDaysAgo(),
      endTime: options.endTime,
      nextToken: options.nextToken,
      granularity: options.granularity || 'hour'
    });
    
    // Convert the response to trend points
    const points: TrendPoint[] = response.data.data.map(point => ({
      timestamp: point.start,
      count: point.tweet_count
    }));
    
    // Store results in cache
    searchCache[cacheKey] = {
      timestamp: Date.now(),
      data: points,
      nextToken: response.data.meta.next_token
    };
    
    return {
      points,
      nextToken: response.data.meta.next_token
    };
  } catch (error) {
    console.error("Error searching tweet counts:", error);
    
    // If API call fails, use mock data in development
    if (import.meta.env.DEV) {
      console.warn("API call failed, falling back to mock data");
      return { points: generateMockTrendPoints() };
    }
    
    throw error;
  }
}

function generateMockTrendPoints(): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  
  // Generate hourly points for the last 7 days
  for (let i = 0; i < 168; i++) { // 7 days * 24 hours
    const timestamp = new Date(now.getTime() - (168 - i) * 60 * 60 * 1000).toISOString();
    points.push({
      timestamp,
      count: Math.floor(Math.random() * 1000) + 100 // Random count between 100 and 1100
    });
  }
  
  return points;
}

// Export the fetchAllPages function
export { fetchAllPages };
