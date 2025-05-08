import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
let newsCache = {
  articles: [],
  timestamp: 0
};

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // allow any localhost port and deployed frontend
    if (origin.startsWith('http://localhost:') || 
        origin.startsWith('https://') || 
        origin.includes('.fly.dev') || 
        origin.includes('.vercel.app')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

// X API endpoint
const X_API_URL = 'https://api.twitter.com/2/tweets/search/recent';

// X API Recent Search Counts endpoint
const X_API_COUNTS_URL = 'https://api.twitter.com/2/tweets/counts/recent';

// Twitter API authentication middleware
const authenticateRequest = async (req, res, next) => {
  const bearerToken = process.env.VITE_TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.log('No bearer token found in environment variables');
    return res.status(401).json({ 
      error: 'Twitter API token not configured. Please set VITE_TWITTER_BEARER_TOKEN environment variable.' 
    });
  }
  
  console.log('Bearer token found, proceeding with request');
  req.bearerToken = bearerToken;
  next();
};

// Search endpoint
app.post('/api/search', authenticateRequest, async (req, res) => {
  try {
    console.log('Received search request with body:', req.body);
    const { keywords = [], maxResults = 100, startTime, endTime, nextToken } = req.body;
    
    if (!keywords.length) {
      console.log('No keywords provided in request');
      return res.status(400).json({ error: 'No keywords provided' });
    }
    
    // Build query string using X API syntax
    const query = keywords.join(' OR ');
    console.log('Constructed query:', query);
    
    // Set up request parameters
    const params = {
      query,
      max_results: Math.min(maxResults, 100), // Ensure we don't exceed Twitter's limit
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'name,username,profile_image_url',
      expansions: 'author_id'
    };
    
    // Add optional parameters
    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;
    if (nextToken) params.next_token = nextToken;
    
    console.log('Making request to Twitter API with params:', params);
    
    // Make request to X API
    const response = await axios.get(X_API_URL, {
      params,
      headers: {
        Authorization: `Bearer ${req.bearerToken}`
      }
    });
    
    console.log('Received response from Twitter API');
    
    // Process the response to match our app's expected format
    const { data, includes } = response.data;
    
    // Create a map of users by ID for easy lookup
    const userMap = {};
    if (includes && includes.users) {
      includes.users.forEach(user => {
        userMap[user.id] = user;
      });
    }
    
    // Format tweets to match our application's Tweet interface
    const formattedTweets = data.map(tweet => {
      const author = userMap[tweet.author_id] || {
        id: tweet.author_id,
        name: 'Unknown User',
        username: 'unknown',
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'
      };
      
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        public_metrics: tweet.public_metrics || {
          retweet_count: 0,
          reply_count: 0,
          like_count: 0,
          quote_count: 0
        },
        author: {
          id: author.id,
          name: author.name,
          username: author.username,
          profile_image_url: author.profile_image_url
        }
      };
    });
    
    console.log(`Sending response with ${formattedTweets.length} tweets`);
    res.json({
      tweets: formattedTweets,
      meta: {
        result_count: formattedTweets.length,
        next_token: response.data.meta?.next_token
      }
    });
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'X API rate limit exceeded. Please try again later.',
        resetTime: error.response.headers['x-rate-limit-reset']
      });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(error.response.status).json({ 
        error: 'Authentication error with X API. Please check your API key.'
      });
    }
    
    res.status(500).json({ 
      error: 'Error fetching tweets from X API',
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Search counts endpoint
app.post('/api/search/counts', authenticateRequest, async (req, res) => {
  try {
    console.log('Received search counts request with body:', req.body);
    const { keywords = [], startTime, endTime, nextToken, granularity = 'hour' } = req.body;

    if (!keywords.length) {
      console.log('No keywords provided in request');
      return res.status(400).json({ error: 'No keywords provided' });
    }

    // Build query string using X API syntax
    const query = keywords.join(' OR ');
    console.log('Constructed query:', query);

    // Set up request parameters
    const params = {
      query,
      granularity
    };
    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;
    if (nextToken) params.next_token = nextToken;

    console.log('Making request to Twitter API Counts endpoint with params:', params);

    // Make request to X API Recent Search Counts endpoint
    const response = await axios.get(X_API_COUNTS_URL, {
      params,
      headers: {
        Authorization: `Bearer ${req.bearerToken}`
      }
    });

    console.log('Received response from Twitter API Counts endpoint');
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'X API rate limit exceeded. Please try again later.',
        resetTime: error.response.headers['x-rate-limit-reset']
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(error.response.status).json({ 
        error: 'Authentication error with X API. Please check your API key.'
      });
    }

    res.status(500).json({ 
      error: 'Error fetching tweet counts from X API',
      details: error.response?.data?.detail || error.message 
    });
  }
});

// AI News endpoint
app.get('/api/news', authenticateRequest, async (req, res) => {
  try {
    console.log('Received AI news request');
    
    if (newsCache.articles.length > 0 && (Date.now() - newsCache.timestamp < NEWS_CACHE_TTL)) {
      console.log('Using cached AI news articles');
      return res.json({
        articles: newsCache.articles,
        meta: {
          cached: true,
          timestamp: newsCache.timestamp
        }
      });
    }
    
    const aiKeywords = [
      'artificial intelligence',
      'machine learning',
      'deep learning',
      'AI news',
      'LLM',
      'large language model',
      'GPT',
      'ChatGPT',
      'AI research',
      'computer vision',
      'neural networks',
      'generative AI'
    ];
    
    // Set up request parameters
    const params = {
      query: aiKeywords.join(' OR '),
      max_results: 50,
      'tweet.fields': 'created_at,public_metrics,author_id,entities',
      'user.fields': 'name,username,profile_image_url,verified',
      expansions: 'author_id,attachments.media_keys',
      'media.fields': 'url,preview_image_url,type'
    };
    
    console.log('Making request to Twitter API with params:', params);
    
    // Make request to X API
    const response = await axios.get(X_API_URL, {
      params,
      headers: {
        Authorization: `Bearer ${req.bearerToken}`
      }
    });
    
    console.log('Received response from Twitter API');
    
    // Process the response
    const { data, includes } = response.data;
    
    // Create a map of users by ID for easy lookup
    const userMap = {};
    if (includes && includes.users) {
      includes.users.forEach(user => {
        userMap[user.id] = user;
      });
    }
    
    // Create a map of media by media_key for easy lookup
    const mediaMap = {};
    if (includes && includes.media) {
      includes.media.forEach(media => {
        mediaMap[media.media_key] = media;
      });
    }
    
    // Format tweets as news articles
    const articles = data.map(tweet => {
      const author = userMap[tweet.author_id] || {
        id: tweet.author_id,
        name: 'Unknown User',
        username: 'unknown',
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
        verified: false
      };
      
      let urls = [];
      let images = [];
      
      if (tweet.entities && tweet.entities.urls) {
        urls = tweet.entities.urls.map(url => ({
          url: url.expanded_url,
          title: url.title || url.display_url,
          description: url.description || ''
        }));
      }
      
      if (tweet.attachments && tweet.attachments.media_keys) {
        images = tweet.attachments.media_keys
          .map(key => mediaMap[key])
          .filter(media => media && (media.type === 'photo' || media.type === 'animated_gif'))
          .map(media => media.url || media.preview_image_url);
      }
      
      return {
        id: tweet.id,
        title: tweet.text.split('\n')[0].substring(0, 100) + (tweet.text.length > 100 ? '...' : ''),
        content: tweet.text,
        publishedAt: tweet.created_at,
        source: 'Twitter/X',
        author: {
          id: author.id,
          name: author.name,
          username: author.username,
          profileImageUrl: author.profile_image_url,
          verified: author.verified
        },
        metrics: tweet.public_metrics || {
          retweet_count: 0,
          reply_count: 0,
          like_count: 0,
          quote_count: 0
        },
        url: `https://twitter.com/${author.username}/status/${tweet.id}`,
        urls: urls,
        images: images
      };
    });
    
    articles.sort((a, b) => {
      const engagementA = a.metrics.like_count + a.metrics.retweet_count;
      const engagementB = b.metrics.like_count + b.metrics.retweet_count;
      return engagementB - engagementA;
    });
    
    newsCache.articles = articles;
    newsCache.timestamp = Date.now();
    
    res.json({
      articles,
      meta: {
        cached: false,
        timestamp: newsCache.timestamp
      }
    });
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'X API rate limit exceeded. Please try again later.',
        resetTime: error.response.headers['x-rate-limit-reset']
      });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(error.response.status).json({ 
        error: 'Authentication error with X API. Please check your API key.'
      });
    }
    
    res.status(500).json({ 
      error: 'Error fetching AI news from X API',
      details: error.response?.data?.detail || error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Twitter API proxy server running on port ${PORT}`);
});
