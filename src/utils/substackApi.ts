import axios from 'axios';
import { TrendPoint, SubstackPost, TrendAnalysis } from '../types';

const API_BASE_URL = 'http://localhost:3002/api/substack';

const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface SubstackCountResponse {
  data: {
    start: string;
    end: string;
    post_count: number;
    sentiment_score: number;
  }[];
  meta: {
    total_post_count: number;
  };
}

interface SearchOptions {
  startTime?: string;
  endTime?: string;
  nextToken?: string;
  granularity?: 'day' | 'week';
}

const searchCache: Record<string, { timestamp: number; data: TrendPoint[]; }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getSixtyDaysAgo(): string {
  const date = new Date();
  date.setDate(date.getDate() - 60);
  return date.toISOString();
}

export async function fetchSubstackCounts(keywords: string[], options: SearchOptions = {}): Promise<TrendPoint[]> {
  try {
    console.log("Searching for Substack post counts with keywords:", keywords);
    
    const cacheKey = JSON.stringify({ keywords, options });
    
    const cached = searchCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log("Using cached results");
      return cached.data;
    }
    
    const response = await api.post<SubstackCountResponse>(`${API_BASE_URL}/counts`, {
      keywords,
      startTime: options.startTime || getSixtyDaysAgo(),
      endTime: options.endTime,
      granularity: options.granularity || 'day'
    });
    
    const points: TrendPoint[] = response.data.data.map(point => ({
      timestamp: point.start,
      count: point.post_count,
      sentiment: point.sentiment_score
    }));
    
    searchCache[cacheKey] = {
      timestamp: Date.now(),
      data: points
    };
    
    return points;
  } catch (error) {
    console.error("Error searching Substack post counts:", error);
    
    if (import.meta.env.DEV) {
      console.warn("API call failed, falling back to mock data");
      return generateMockTrendPoints();
    }
    
    throw error;
  }
}

export async function fetchSubstackPosts(keywords: string[], options: SearchOptions = {}): Promise<SubstackPost[]> {
  try {
    console.log("Fetching Substack posts with keywords:", keywords);
    
    const response = await api.post<{ posts: SubstackPost[] }>(`${API_BASE_URL}/posts`, {
      keywords,
      startTime: options.startTime || getSixtyDaysAgo(),
      endTime: options.endTime,
      maxResults: 100
    });
    
    return response.data.posts;
  } catch (error) {
    console.error("Error fetching Substack posts:", error);
    
    if (import.meta.env.DEV) {
      console.warn("API call failed, falling back to mock data");
      return generateMockPosts();
    }
    
    throw error;
  }
}

export async function analyzeSubstackTrends(options: SearchOptions = {}): Promise<TrendAnalysis> {
  try {
    console.log("Analyzing Substack trends");
    
    const response = await api.post<TrendAnalysis>(`${API_BASE_URL}/trends`, {
      startTime: options.startTime || getSixtyDaysAgo(),
      endTime: options.endTime
    });
    
    return response.data;
  } catch (error) {
    console.error("Error analyzing Substack trends:", error);
    
    if (import.meta.env.DEV) {
      console.warn("API call failed, falling back to mock data");
      return generateMockTrendAnalysis();
    }
    
    throw error;
  }
}

function generateMockTrendPoints(): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  
  for (let i = 0; i < 60; i++) {
    const timestamp = new Date(now.getTime() - (60 - i) * 24 * 60 * 60 * 1000).toISOString();
    points.push({
      timestamp,
      count: Math.floor(Math.random() * 20) + 5, // Random count between 5 and 25
      sentiment: (Math.random() * 10 - 5) // Random sentiment between -5 and 5
    });
  }
  
  return points;
}

function generateMockPosts(): SubstackPost[] {
  const posts: SubstackPost[] = [];
  const now = new Date();
  const writers = [
    { name: 'Stratechery', url: 'https://stratechery.com' },
    { name: 'The Batch', url: 'https://www.deeplearning.ai/the-batch' },
    { name: 'Import AI', url: 'https://importai.net' }
  ];
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(now.getTime() - (60 - i) * 24 * 60 * 60 * 1000);
    
    const postsPerDay = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < postsPerDay; j++) {
      const writer = writers[Math.floor(Math.random() * writers.length)];
      const sentimentScore = Math.floor(Math.random() * 10) - 5;
      
      posts.push({
        id: `post-${date.toISOString()}-${j}`,
        title: `Mock Substack Post ${i}-${j}`,
        excerpt: 'This is a mock Substack post for testing purposes.',
        url: `${writer.url}/post-${i}-${j}`,
        created_at: date.toISOString(),
        author: {
          id: writer.name.toLowerCase().replace(/\s+/g, '-'),
          name: writer.name,
          url: writer.url
        },
        keywords: ['ai', 'tech', 'substack'],
        sentiment: {
          score: sentimentScore,
          comparative: sentimentScore / 10,
          positive: sentimentScore > 0 ? ['good', 'great'] : [],
          negative: sentimentScore < 0 ? ['bad', 'poor'] : []
        }
      });
    }
  }
  
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function generateMockTrendAnalysis(): TrendAnalysis {
  return {
    overall_trends: {
      top_keywords: ['ai', 'machine learning', 'gpt', 'llm', 'tech', 'data', 'neural', 'transformer', 'model', 'deep learning'],
      total_posts: 120,
      avg_sentiment: 1.2
    },
    weekly_trends: Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (7 * (8 - i - 1)));
      return {
        week: date.toISOString().split('T')[0],
        post_count: Math.floor(Math.random() * 20) + 5,
        top_keywords: ['ai', 'machine learning', 'gpt'].slice(0, Math.floor(Math.random() * 3) + 1),
        avg_sentiment: (Math.random() * 6) - 3
      };
    }),
    emerging_trends: [
      { keyword: 'llm', trend_score: 2.5, total_occurrences: 15 },
      { keyword: 'gpt-4', trend_score: 2.2, total_occurrences: 12 },
      { keyword: 'transformer', trend_score: 1.8, total_occurrences: 10 }
    ],
    sentiment_shifts: [
      {
        from_week: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to_week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sentiment_change: 1.2,
        direction: 'positive'
      }
    ],
    meta: {
      start_time: getSixtyDaysAgo(),
      end_time: new Date().toISOString()
    }
  };
}
