import { Tweet } from '../types';

export function generateMockTweets(keywords: string[], count: number = 50): Tweet[] {
  const tweets: Tweet[] = [];
  const now = new Date();
  
  const generateOpinionsFromKeywords = (keywords: string[]): string[] => {
    const baseOpinions = [
      "This is gaining a lot of traction in the market right now!",
      "I'm skeptical about the hype around this. Seems overvalued.",
      "The latest developments are really impressive.",
      "This is significantly better than previous versions for most use cases.",
      "Funding in this sector is slowing down. Investors are more selective now.",
      "The price surge is justified by their market dominance.",
      "Open alternatives will eventually outperform the closed options.",
      "The concerns are overblown. We're nowhere near seeing major disruption yet.",
      "Regulation will slow down innovation in this space in the US and Europe.",
      "This is the next big wave after recent trends.",
      "The old approach is dead. Companies need to pivot to survive.",
      "This sector is making a comeback as prices reach new highs.",
      "Autonomous solutions in this space will be the next breakthrough.",
      "Recent layoffs are creating opportunities for new players to hire top talent.",
      "Specialized solutions for specific industries will create more value than general platforms.",
      "This bubble will burst within 2 years. Most companies will fail.",
      "Local processing is the future. Running systems on-device will be more important than cloud.",
      "Companies in this space are overpromising and underdelivering.",
      "Using advanced technology for this application will create the next trillion-dollar companies.",
      "Progress has hit a plateau. Full implementation is still years away."
    ];
    
    return baseOpinions.map(opinion => {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)];
      return keyword + " " + opinion;
    });
  };
  
  const opinions = generateOpinionsFromKeywords(keywords);
  
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
