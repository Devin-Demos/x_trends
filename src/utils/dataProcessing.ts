
import { Tweet, TrendPoint } from '../types';

export function generateMockTweets(): Tweet[] {
  const mockTweets: Tweet[] = [
    {
      id: '1',
      text: 'ChatGPT is revolutionizing how we interact with AI. The ability to have natural conversations with AI is changing everything from customer service to content creation.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 1250,
        reply_count: 89,
        like_count: 3400,
        quote_count: 120
      },
      author: {
        id: '12345',
        name: 'AI Enthusiast',
        username: 'ai_fan',
        profile_image_url: 'https://pbs.twimg.com/profile_images/1234567890/avatar.jpg'
      }
    },
    {
      id: '2',
      text: 'Just tried DALL-E 3 and I\'m blown away by how it understands complex prompts. The image quality is incredible compared to earlier versions.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 980,
        reply_count: 65,
        like_count: 2800,
        quote_count: 95
      },
      author: {
        id: '23456',
        name: 'Digital Artist',
        username: 'creative_ai',
        profile_image_url: 'https://pbs.twimg.com/profile_images/2345678901/artist.jpg'
      }
    },
    {
      id: '3',
      text: 'Midjourney v6 is setting new standards for AI image generation. The level of detail and realism is approaching photographic quality.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 850,
        reply_count: 72,
        like_count: 2300,
        quote_count: 88
      },
      author: {
        id: '34567',
        name: 'Tech Reviewer',
        username: 'tech_review',
        profile_image_url: 'https://pbs.twimg.com/profile_images/3456789012/reviewer.jpg'
      }
    },
    {
      id: '4',
      text: 'Generative AI is transforming product design. We can now iterate through hundreds of design concepts in minutes instead of weeks.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 720,
        reply_count: 58,
        like_count: 1900,
        quote_count: 76
      },
      author: {
        id: '45678',
        name: 'Product Designer',
        username: 'design_thinker',
        profile_image_url: 'https://pbs.twimg.com/profile_images/4567890123/designer.jpg'
      }
    },
    {
      id: '5',
      text: 'Claude AI from Anthropic is showing impressive reasoning capabilities. Their focus on constitutional AI and safety is setting them apart.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 650,
        reply_count: 47,
        like_count: 1700,
        quote_count: 62
      },
      author: {
        id: '56789',
        name: 'AI Safety Advocate',
        username: 'safe_ai',
        profile_image_url: 'https://pbs.twimg.com/profile_images/5678901234/safety.jpg'
      }
    },
    {
      id: '6',
      text: 'Stable Diffusion XL is now available to everyone! The open source approach to generative AI is democratizing access to these powerful tools.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 580,
        reply_count: 43,
        like_count: 1500,
        quote_count: 55
      },
      author: {
        id: '67890',
        name: 'Open Source Advocate',
        username: 'open_ai_tools',
        profile_image_url: 'https://pbs.twimg.com/profile_images/6789012345/opensource.jpg'
      }
    },
    {
      id: '7',
      text: 'GPT-4 is showing remarkable capabilities in coding. It can now understand complex programming tasks and generate working solutions.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 520,
        reply_count: 38,
        like_count: 1350,
        quote_count: 48
      },
      author: {
        id: '78901',
        name: 'Code Wizard',
        username: 'ai_coder',
        profile_image_url: 'https://pbs.twimg.com/profile_images/7890123456/coder.jpg'
      }
    },
    {
      id: '8',
      text: 'The combination of LLMs and image generation is creating new possibilities for creative workflows. Text-to-image-to-text pipelines are game-changing.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 470,
        reply_count: 35,
        like_count: 1200,
        quote_count: 42
      },
      author: {
        id: '89012',
        name: 'Creative Technologist',
        username: 'create_with_ai',
        profile_image_url: 'https://pbs.twimg.com/profile_images/8901234567/creative.jpg'
      }
    },
    {
      id: '9',
      text: 'Gemini AI from Google is showing impressive multimodal capabilities. The ability to reason across text, images, and code is a major step forward.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 420,
        reply_count: 32,
        like_count: 1100,
        quote_count: 38
      },
      author: {
        id: '90123',
        name: 'AI Researcher',
        username: 'ai_science',
        profile_image_url: 'https://pbs.twimg.com/profile_images/9012345678/researcher.jpg'
      }
    },
    {
      id: '10',
      text: 'The ethical implications of generative AI are profound. We need thoughtful regulation that balances innovation with responsible use.',
      created_at: new Date().toISOString(),
      public_metrics: {
        retweet_count: 380,
        reply_count: 29,
        like_count: 980,
        quote_count: 34
      },
      author: {
        id: '01234',
        name: 'Ethics Professor',
        username: 'ai_ethics',
        profile_image_url: 'https://pbs.twimg.com/profile_images/0123456789/ethics.jpg'
      }
    }
  ];
  
  return mockTweets;
}

export function processTweetData(tweets: Tweet[]): TrendPoint[] {
  // Sort tweets by creation date
  const sortedTweets = [...tweets].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Group tweets by day
  const tweetsByDay = new Map<string, number>();

  sortedTweets.forEach(tweet => {
    const date = new Date(tweet.created_at);
    const dayKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    if (tweetsByDay.has(dayKey)) {
      tweetsByDay.set(dayKey, tweetsByDay.get(dayKey)! + 1);
    } else {
      tweetsByDay.set(dayKey, 1);
    }
  });

  // Convert to trend points array
  const trendPoints: TrendPoint[] = Array.from(tweetsByDay.entries()).map(
    ([timestamp, count]) => ({
      timestamp,
      count
    })
  );

  return trendPoints;
}

export function findNotableTweets(tweets: Tweet[], count: number = 5): Tweet[] {
  // Sort tweets by engagement (using a simple sum of metrics)
  const sortedTweets = [...tweets].sort((a, b) => {
    const engagementA = 
      a.public_metrics.like_count + 
      a.public_metrics.retweet_count * 2 + 
      a.public_metrics.quote_count * 1.5 + 
      a.public_metrics.reply_count;
      
    const engagementB = 
      b.public_metrics.like_count + 
      b.public_metrics.retweet_count * 2 + 
      b.public_metrics.quote_count * 1.5 + 
      b.public_metrics.reply_count;
      
    return engagementB - engagementA;
  });

  // Return top N tweets
  return sortedTweets.slice(0, count);
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
