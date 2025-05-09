import { Tweet } from '../types';

export function generateMockTweets(keywords: string[], count: number = 50): Tweet[] {
  const tweets: Tweet[] = [];
  const now = new Date();
  
  const opinions = [
    "AI is revolutionizing how we build software. The productivity gains are incredible!",
    "ChatGPT and other LLMs are overhyped. They hallucinate too much to be reliable.",
    "The new Apple Vision Pro is a game-changer for spatial computing.",
    "Anthropic's Claude 3 is significantly better than GPT-4 for most enterprise use cases.",
    "Tech startups are facing a funding winter. VCs are much more selective now.",
    "Nvidia's stock price surge is justified by their AI chip dominance.",
    "Open source AI models will eventually outperform closed models like GPT-4.",
    "The AI safety concerns are overblown. We're nowhere near AGI or superintelligence.",
    "Regulation will slow down AI innovation in the US and Europe compared to China.",
    "Robotics startups are the next big wave after generative AI.",
    "The metaverse is dead. AR/VR startups need to pivot to AI to survive.",
    "Crypto and web3 startups are making a comeback as Bitcoin reaches new highs.",
    "AI agents that can autonomously perform tasks will be the next breakthrough.",
    "Tech layoffs are creating a great opportunity for startups to hire top talent.",
    "Vertical AI solutions for specific industries will create more value than horizontal platforms.",
    "The AI bubble will burst within 2 years. Most AI startups will fail.",
    "Edge AI is the future. Running models locally will be more important than cloud APIs.",
    "Quantum computing startups are overpromising and underdelivering.",
    "Biotech startups using AI for drug discovery will create the next trillion-dollar companies.",
    "Self-driving technology has hit a plateau. Full autonomy is still decades away."
  ];
  
  for (let i = 0; i < count; i++) {
    const opinionIndex = Math.floor(Math.random() * opinions.length);
    const opinionText = opinions[opinionIndex];
    
    let tweetText = opinionText;
    const keywordsToAdd = Math.min(2, keywords.length);
    const usedKeywordIndices = new Set<number>();
    
    for (let j = 0; j < keywordsToAdd; j++) {
      let keywordIndex;
      do {
        keywordIndex = Math.floor(Math.random() * keywords.length);
      } while (usedKeywordIndices.has(keywordIndex));
      
      usedKeywordIndices.add(keywordIndex);
      if (Math.random() > 0.5 && !tweetText.toLowerCase().includes(keywords[keywordIndex].toLowerCase())) {
        tweetText += ` #${keywords[keywordIndex].replace(/\s+/g, '')}`;
      }
    }
    
    const hoursAgo = Math.random() * 24;
    const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
    
    const retweetCount = Math.floor(Math.random() * 1000);
    const replyCount = Math.floor(Math.random() * 500);
    const likeCount = Math.floor(Math.random() * 2000);
    const quoteCount = Math.floor(Math.random() * 200);
    
    tweets.push({
      id: `mock-tweet-${i}`,
      text: tweetText,
      created_at: createdAt,
      public_metrics: {
        retweet_count: retweetCount,
        reply_count: replyCount,
        like_count: likeCount,
        quote_count: quoteCount
      },
      author: {
        id: `author-${Math.floor(Math.random() * 1000)}`,
        name: `User ${Math.floor(Math.random() * 1000)}`,
        username: `user${Math.floor(Math.random() * 1000)}`,
        profile_image_url: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'
      }
    });
  }
  
  return tweets;
}
