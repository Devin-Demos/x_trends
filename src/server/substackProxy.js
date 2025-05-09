import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Sentiment from 'sentiment';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.SUBSTACK_PORT || 3002;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
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

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

const TOP_SUBSTACK_WRITERS = [
  { name: 'Stratechery', url: 'https://stratechery.com' },
  { name: 'The Batch', url: 'https://www.deeplearning.ai/the-batch' },
  { name: 'Import AI', url: 'https://importai.net' },
  { name: 'The Gradient', url: 'https://thegradient.pub' },
  { name: 'The Algorithmic Bridge', url: 'https://thealgorithmicbridge.substack.com' },
  { name: 'The Sequence', url: 'https://thesequence.substack.com' },
  { name: 'Machine Learning Street Talk', url: 'https://mlst.substack.com' },
  { name: 'Last Week in AI', url: 'https://lastweekin.ai' },
  { name: 'Bens Bites', url: 'https://bensbites.beehiiv.com' },
  { name: 'Lennys Newsletter', url: 'https://www.lennysnewsletter.com' }
];

const sentimentAnalyzer = new Sentiment();

const SUBSTACK_COOKIES = {
  '_cf_bm': process.env.__cf_bm || '',
  'AWSALBTG': process.env.AWSALBTG || '',
  'substack.sid': process.env.SUBSTACK_SID || ''
};

const cache = {
  posts: new Map(),
  trends: new Map(),
  lastUpdated: null
};

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

async function extractPostData(url) {
  try {
    const cookieString = Object.entries(SUBSTACK_COOKIES)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    const response = await axios.get(url, {
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const title = $('h1').first().text().trim() || 
                 $('.post-title').text().trim() || 
                 $('.headline').text().trim();
    
    const content = $('article').text().trim() || 
                   $('.body').text().trim() || 
                   $('.post-content').text().trim();
    
    let dateStr = $('time').first().attr('datetime');
    if (!dateStr) {
      dateStr = $('time').first().text().trim() || 
               $('.post-date').text().trim();
    }
    const date = dateStr ? new Date(dateStr) : new Date();
    
    const authorName = $('.author-name').text().trim() || 
                      $('.byline').text().trim() || 
                      'Unknown Author';
    
    const authorUrl = $('.author-name a').attr('href') || 
                     $('.byline a').attr('href') || 
                     '';
    
    const sentimentResult = sentimentAnalyzer.analyze(content);
    
    const excerpt = content.substring(0, 500) + '...';
    
    return {
      title,
      excerpt,
      content: content.substring(0, 5000), // Store more content for better analysis
      url,
      created_at: date.toISOString(),
      author: {
        id: authorName.toLowerCase().replace(/\s+/g, '-'),
        name: authorName,
        url: authorUrl
      },
      sentiment: {
        score: sentimentResult.score,
        comparative: sentimentResult.comparative,
        positive: sentimentResult.positive,
        negative: sentimentResult.negative
      }
    };
  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error.message);
    return null;
  }
}

function extractKeywords(content, count = 10) {
  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const stopWords = new Set(['about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'cannot', 'could', 'did', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'here', 'how', 'into', 'itself', 'just', 'more', 'most', 'not', 'now', 'off', 'once', 'only', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves']);
  
  const wordCounts = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

app.post('/api/substack/posts', async (req, res) => {
  try {
    console.log('Received Substack posts request with body:', req.body);
    const { keywords = [], startTime, endTime, maxResults = 100 } = req.body;
    
    const startDate = startTime ? new Date(startTime) : new Date(getDateDaysAgo(60));
    const endDate = endTime ? new Date(endTime) : new Date();
    
    console.log(`Fetching posts from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const cacheKey = `${startDate.toISOString()}-${endDate.toISOString()}-${keywords.join(',')}`;
    if (cache.posts.has(cacheKey)) {
      console.log('Returning cached posts data');
      return res.json(cache.posts.get(cacheKey));
    }
    
    const allPosts = [];
    
    for (const writer of TOP_SUBSTACK_WRITERS) {
      try {
        console.log(`Fetching posts from ${writer.name} at ${writer.url}`);
        
        const cookieString = Object.entries(SUBSTACK_COOKIES)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
        
        const response = await axios.get(writer.url, {
          headers: {
            'Cookie': cookieString,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        
        const postLinks = [];
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && (href.includes('/p/') || href.includes('/archive/'))) {
            if (!postLinks.includes(href)) {
              postLinks.push(href);
            }
          }
        });
        
        console.log(`Found ${postLinks.length} post links for ${writer.name}`);
        
        for (let i = 0; i < Math.min(5, postLinks.length); i++) {
          let postUrl = postLinks[i];
          
          if (!postUrl.startsWith('http')) {
            postUrl = new URL(postUrl, writer.url).toString();
          }
          
          const postData = await extractPostData(postUrl);
          
          if (postData) {
            const extractedKeywords = extractKeywords(postData.content);
            
            allPosts.push({
              id: `post-${postData.created_at}-${i}`,
              title: postData.title,
              excerpt: postData.excerpt,
              url: postUrl,
              created_at: postData.created_at,
              author: postData.author,
              keywords: extractedKeywords,
              sentiment: postData.sentiment
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching posts from ${writer.name}:`, error.message);
      }
    }
    
    if (allPosts.length === 0) {
      console.log('No posts found, falling back to mock data');
      
      for (let i = 0; i < 60; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        
        const postsPerDay = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < postsPerDay; j++) {
          const writer = TOP_SUBSTACK_WRITERS[Math.floor(Math.random() * TOP_SUBSTACK_WRITERS.length)];
          const postKeywords = keywords.length > 0 
            ? keywords.filter(() => Math.random() > 0.5) 
            : ['ai', 'machine learning', 'tech', 'substack'];
          
          const sentimentScore = Math.floor(Math.random() * 10) - 5;
          
          allPosts.push({
            id: `mock-post-${date.toISOString()}-${j}`,
            title: `${writer.name} - Post about ${postKeywords.join(', ')}`,
            excerpt: `This is a simulated post about ${postKeywords.join(', ')} from ${writer.name}.`,
            url: `${writer.url}/post-${i}-${j}`,
            created_at: date.toISOString(),
            author: {
              id: writer.name.toLowerCase().replace(/\s+/g, '-'),
              name: writer.name,
              url: writer.url
            },
            keywords: postKeywords,
            sentiment: {
              score: sentimentScore,
              comparative: sentimentScore / 10,
              positive: sentimentScore > 0 ? ['good', 'great', 'excellent'] : [],
              negative: sentimentScore < 0 ? ['bad', 'poor', 'disappointing'] : []
            }
          });
        }
      }
    }
    
    let filteredPosts = allPosts;
    if (keywords.length > 0) {
      const keywordRegex = new RegExp(keywords.join('|'), 'i');
      filteredPosts = allPosts.filter(post => 
        keywordRegex.test(post.title) || 
        keywordRegex.test(post.excerpt) ||
        post.keywords.some(k => keywordRegex.test(k))
      );
    }
    
    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate >= startDate && postDate <= endDate;
    });
    
    filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    filteredPosts = filteredPosts.slice(0, maxResults);
    
    const result = {
      posts: filteredPosts,
      meta: {
        result_count: filteredPosts.length,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      }
    };
    
    cache.posts.set(cacheKey, result);
    cache.lastUpdated = new Date().toISOString();
    
    console.log(`Sending response with ${filteredPosts.length} posts`);
    res.json(result);
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Error fetching Substack posts',
      details: error.message 
    });
  }
});

app.post('/api/substack/counts', async (req, res) => {
  try {
    console.log('Received Substack counts request with body:', req.body);
    const { keywords = [], startTime, endTime, granularity = 'day' } = req.body;
    
    const startDate = startTime ? new Date(startTime) : new Date(getDateDaysAgo(60));
    const endDate = endTime ? new Date(endTime) : new Date();
    
    console.log(`Fetching post counts from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const cacheKey = `counts-${startDate.toISOString()}-${endDate.toISOString()}-${keywords.join(',')}-${granularity}`;
    if (cache.trends.has(cacheKey)) {
      console.log('Returning cached counts data');
      return res.json(cache.trends.get(cacheKey));
    }
    
    const postsResponse = await axios.post('http://localhost:3002/api/substack/posts', {
      keywords,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      maxResults: 1000 // Get more posts for accurate counts
    });
    
    const posts = postsResponse.data.posts;
    
    const countsByTime = new Map();
    const sentimentByTime = new Map();
    
    posts.forEach(post => {
      const date = new Date(post.created_at);
      let timeKey;
      
      if (granularity === 'hour') {
        timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();
      } else {
        timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      }
      
      countsByTime.set(timeKey, (countsByTime.get(timeKey) || 0) + 1);
      
      if (!sentimentByTime.has(timeKey)) {
        sentimentByTime.set(timeKey, []);
      }
      sentimentByTime.get(timeKey).push(post.sentiment.score);
    });
    
    const data = Array.from(countsByTime.entries()).map(([timestamp, count]) => {
      const sentimentScores = sentimentByTime.get(timestamp) || [];
      const avgSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
        : 0;
      
      return {
        start: timestamp,
        end: timestamp, // Same as start for simplicity
        post_count: count,
        sentiment_score: avgSentiment
      };
    });
    
    data.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    const totalPostCount = data.reduce((sum, item) => sum + item.post_count, 0);
    
    const result = {
      data,
      meta: {
        total_post_count: totalPostCount,
        granularity
      }
    };
    
    cache.trends.set(cacheKey, result);
    
    console.log(`Sending response with ${data.length} time periods`);
    res.json(result);
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Error fetching Substack post counts',
      details: error.message 
    });
  }
});

app.post('/api/substack/trends', async (req, res) => {
  try {
    console.log('Received Substack trends request with body:', req.body);
    const { startTime, endTime } = req.body;
    
    const startDate = startTime ? new Date(startTime) : new Date(getDateDaysAgo(60));
    const endDate = endTime ? new Date(endTime) : new Date();
    
    const postsResponse = await axios.post('http://localhost:3002/api/substack/posts', {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      maxResults: 1000 // Get more posts for accurate trend analysis
    });
    
    const posts = postsResponse.data.posts;
    
    const allContent = posts.map(post => post.title + ' ' + post.excerpt).join(' ');
    
    const topKeywords = extractKeywords(allContent, 20);
    
    const postsByWeek = new Map();
    const sentimentByWeek = new Map();
    
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!postsByWeek.has(weekKey)) {
        postsByWeek.set(weekKey, []);
        sentimentByWeek.set(weekKey, []);
      }
      
      postsByWeek.get(weekKey).push(post);
      sentimentByWeek.get(weekKey).push(post.sentiment.score);
    });
    
    const weeklyTrends = Array.from(postsByWeek.entries()).map(([week, weekPosts]) => {
      const weekContent = weekPosts.map(post => post.title + ' ' + post.excerpt).join(' ');
      const weekKeywords = extractKeywords(weekContent, 10);
      
      const sentimentScores = sentimentByWeek.get(week);
      const avgSentiment = sentimentScores.length > 0
        ? sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length
        : 0;
      
      return {
        week,
        post_count: weekPosts.length,
        top_keywords: weekKeywords,
        avg_sentiment: avgSentiment
      };
    });
    
    weeklyTrends.sort((a, b) => new Date(a.week) - new Date(b.week));
    
    const keywordFrequencyByWeek = new Map();
    
    weeklyTrends.forEach(week => {
      week.top_keywords.forEach(keyword => {
        if (!keywordFrequencyByWeek.has(keyword)) {
          keywordFrequencyByWeek.set(keyword, []);
        }
        keywordFrequencyByWeek.get(keyword).push({
          week: week.week,
          count: week.top_keywords.filter(k => k === keyword).length
        });
      });
    });
    
    const trendScores = Array.from(keywordFrequencyByWeek.entries()).map(([keyword, occurrences]) => {
      const totalOccurrences = occurrences.length;
      const recentWeeks = weeklyTrends.slice(-2).map(w => w.week);
      const recentOccurrences = occurrences.filter(o => recentWeeks.includes(o.week)).length;
      
      const trendScore = (recentOccurrences / Math.max(1, recentWeeks.length)) / 
                         (totalOccurrences / Math.max(1, weeklyTrends.length));
      
      return {
        keyword,
        trend_score: trendScore,
        total_occurrences: totalOccurrences
      };
    });
    
    trendScores.sort((a, b) => b.trend_score - a.trend_score);
    
    const sentimentShifts = [];
    for (let i = 1; i < weeklyTrends.length; i++) {
      const prevWeek = weeklyTrends[i-1];
      const currWeek = weeklyTrends[i];
      const sentimentChange = currWeek.avg_sentiment - prevWeek.avg_sentiment;
      
      if (Math.abs(sentimentChange) > 0.5) { // Threshold for significant change
        sentimentShifts.push({
          from_week: prevWeek.week,
          to_week: currWeek.week,
          sentiment_change: sentimentChange,
          direction: sentimentChange > 0 ? 'positive' : 'negative'
        });
      }
    }
    
    const result = {
      overall_trends: {
        top_keywords: topKeywords,
        total_posts: posts.length,
        avg_sentiment: posts.reduce((sum, post) => sum + post.sentiment.score, 0) / posts.length
      },
      weekly_trends: weeklyTrends,
      emerging_trends: trendScores.slice(0, 10), // Top 10 emerging trends
      sentiment_shifts: sentimentShifts,
      meta: {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString()
      }
    };
    
    console.log('Sending trends analysis response');
    res.json(result);
    
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Error analyzing Substack trends',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Substack API proxy server running on port ${PORT}`);
});
