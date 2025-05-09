import { Tweet, Opinion } from '../types';

export function analyzeSentiment(text: string): number {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic',
    'wonderful', 'brilliant', 'outstanding', 'superb', 'impressive',
    'innovative', 'revolutionary', 'breakthrough', 'exciting', 'promising',
    'potential', 'opportunity', 'success', 'successful', 'growth',
    'growing', 'improve', 'improved', 'improvement', 'advance',
    'advancement', 'progress', 'progressive', 'solution', 'solve',
    'solved', 'effective', 'efficient', 'optimistic', 'positive',
    'benefit', 'beneficial', 'advantage', 'advantageous', 'win',
    'winning', 'winner', 'profit', 'profitable', 'gain', 'valuable',
    'worth', 'worthy', 'recommend', 'recommended', 'approve', 'approved',
    'support', 'supporting', 'supported', 'like', 'love', 'enjoy'
  ];

  const negativeWords = [
    'bad', 'terrible', 'horrible', 'awful', 'poor', 'disappointing',
    'disappointed', 'disappoints', 'disappoint', 'failure', 'fail',
    'failing', 'failed', 'problem', 'problematic', 'issue', 'issues',
    'concern', 'concerning', 'concerned', 'worry', 'worrying', 'worried',
    'fear', 'fearful', 'afraid', 'risk', 'risky', 'danger', 'dangerous',
    'threat', 'threatening', 'negative', 'pessimistic', 'skeptical',
    'doubt', 'doubtful', 'uncertain', 'uncertainty', 'unstable',
    'volatile', 'decline', 'declining', 'decrease', 'decreasing',
    'loss', 'lose', 'losing', 'lost', 'costly', 'expensive',
    'overpriced', 'overvalued', 'bubble', 'crash', 'crisis',
    'disaster', 'catastrophe', 'trouble', 'difficult', 'challenging',
    'challenge', 'hard', 'complicated', 'complex', 'confusing',
    'confused', 'confusion', 'misleading', 'misled', 'mislead',
    'deceptive', 'deceive', 'deceived', 'lie', 'lying', 'lied',
    'false', 'fake', 'fraud', 'fraudulent', 'scam', 'scheme',
    'suspicious', 'suspect', 'questionable', 'controversy', 'controversial',
    'criticism', 'criticize', 'criticized', 'attack', 'attacking',
    'attacked', 'against', 'oppose', 'opposing', 'opposed',
    'reject', 'rejecting', 'rejected', 'deny', 'denying', 'denied',
    'refuse', 'refusing', 'refused', 'block', 'blocking', 'blocked',
    'stop', 'stopping', 'stopped', 'end', 'ending', 'ended',
    'terminate', 'terminating', 'terminated', 'cancel', 'canceling',
    'canceled', 'abandon', 'abandoning', 'abandoned', 'discontinue',
    'discontinuing', 'discontinued', 'withdraw', 'withdrawing', 'withdrawn'
  ];

  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  const totalWords = positiveCount + negativeCount;
  if (totalWords === 0) return 0;
  
  return (positiveCount - negativeCount) / totalWords;
}

export function extractKeywords(text: string): string[] {
  const stopWords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
    'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
    'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
    'should', 'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s',
    'it\'s', 'we\'re', 'they\'re', 'i\'ve', 'you\'ve', 'we\'ve',
    'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d',
    'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll',
    'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t',
    'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t',
    'shan\'t', 'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t', 'mustn\'t',
    'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s', 'there\'s',
    'when\'s', 'where\'s', 'why\'s', 'how\'s', 'for', 'of', 'about'
  ];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  const wordFrequency: Record<string, number> = {};
  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  }
  
  return Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}

export function groupTweetsIntoOpinions(tweets: Tweet[]): Opinion[] {
  if (!tweets || tweets.length === 0) return [];
  
  const opinions: Opinion[] = [];
  const processedTweets = new Set<string>();
  
  for (const tweet of tweets) {
    if (processedTweets.has(tweet.id)) continue;
    
    const keywords = extractKeywords(tweet.text);
    const sentiment = analyzeSentiment(tweet.text);
    
    const similarTweets = tweets.filter(t => {
      if (t.id === tweet.id || processedTweets.has(t.id)) return false;
      
      const tweetKeywords = extractKeywords(t.text);
      const commonKeywords = keywords.filter(k => tweetKeywords.includes(k));
      return commonKeywords.length >= 2;
    });
    
    processedTweets.add(tweet.id);
    similarTweets.forEach(t => processedTweets.add(t.id));
    
    const allRelatedTweets = [tweet, ...similarTweets];
    const totalEngagement = allRelatedTweets.reduce((sum, t) => {
      return sum + t.public_metrics.retweet_count + 
                  t.public_metrics.like_count + 
                  t.public_metrics.reply_count;
    }, 0);
    
    opinions.push({
      id: tweet.id,
      text: tweet.text,
      sentiment,
      momentum: 0, // Will be calculated later
      agreement: totalEngagement,
      source: 'twitter',
      keywords,
      createdAt: tweet.created_at,
      tweetCount: allRelatedTweets.length
    });
  }
  
  return opinions;
}

export function calculateMomentum(opinions: Opinion[], previousOpinions: Opinion[] = []): Opinion[] {
  return opinions.map(opinion => {
    const previousOpinion = previousOpinions.find(p => 
      p.keywords.some(k => opinion.keywords.includes(k))
    );
    
    let momentum = 0;
    
    if (previousOpinion) {
      momentum = opinion.agreement - previousOpinion.agreement;
    } else {
      momentum = opinion.agreement;
    }
    
    return {
      ...opinion,
      momentum
    };
  });
}

export function getTopOpinions(opinions: Opinion[], count: number = 10): {
  rising: Opinion[];
  falling: Opinion[];
} {
  const sortedOpinions = [...opinions].sort((a, b) => b.momentum - a.momentum);
  
  return {
    rising: sortedOpinions.slice(0, count),
    falling: sortedOpinions.slice(-count).reverse()
  };
}
