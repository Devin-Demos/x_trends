import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // allow any localhost port
    if (origin.startsWith('http://localhost:')) {
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

// Start the server
app.listen(PORT, () => {
  console.log(`Twitter API proxy server running on port ${PORT}`);
});
