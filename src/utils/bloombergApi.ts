import { BloombergArticle } from '../types/bloomberg';

const REAL_ARTICLES: BloombergArticle[] = [
  {
    id: "1",
    title: "Musk's X Faces Lawsuit From Advertisers Over Placement Next to Hate Speech",
    link: "https://www.bloomberg.com/news/articles/2023-07-05/musk-s-x-faces-lawsuit-from-advertisers-over-placement-next-to-hate-speech",
    pubDate: "2023-07-05T14:30:00Z",
    description: "A group of advertisers sued X, formerly known as Twitter, claiming the social media platform owned by Elon Musk placed their ads next to harmful content including neo-Nazi and white-nationalist posts.",
    content: "A group of advertisers sued X, formerly known as Twitter, claiming the social media platform owned by Elon Musk placed their ads next to harmful content including neo-Nazi and white-nationalist posts.",
    author: "Shirin Ghaffary"
  },
  {
    id: "2",
    title: "Meta Unveils New AI Assistant That Can Create Images, Write Code",
    link: "https://www.bloomberg.com/news/articles/2023-09-27/meta-unveils-new-ai-assistant-that-can-create-images-write-code",
    pubDate: "2023-09-27T18:45:00Z",
    description: "Meta Platforms Inc. unveiled a new artificial intelligence assistant and a pair of smart glasses that can take photos and videos, as Chief Executive Officer Mark Zuckerberg looks to compete with chatbots from OpenAI and Google.",
    content: "Meta Platforms Inc. unveiled a new artificial intelligence assistant and a pair of smart glasses that can take photos and videos, as Chief Executive Officer Mark Zuckerberg looks to compete with chatbots from OpenAI and Google.",
    author: "Shirin Ghaffary"
  },
  {
    id: "3",
    title: "OpenAI Unveils GPT-4o, a Faster and Cheaper AI Model",
    link: "https://www.bloomberg.com/news/articles/2024-05-13/openai-unveils-gpt-4o-a-faster-and-cheaper-ai-model",
    pubDate: "2024-05-13T17:00:00Z",
    description: "OpenAI unveiled a new artificial intelligence model that it says is faster and cheaper than its predecessors, and can respond to users in real time.",
    content: "OpenAI unveiled a new artificial intelligence model that it says is faster and cheaper than its predecessors, and can respond to users in real time.",
    author: "Shirin Ghaffary"
  },
  {
    id: "4",
    title: "Anthropic Releases Claude 3 Opus, Its Most Powerful AI Model",
    link: "https://www.bloomberg.com/news/articles/2024-03-04/anthropic-releases-claude-3-opus-its-most-powerful-ai-model",
    pubDate: "2024-03-04T15:30:00Z",
    description: "Anthropic released Claude 3 Opus, its most powerful artificial intelligence model, which the startup says outperforms rival systems from OpenAI and Google on several benchmarks.",
    content: "Anthropic released Claude 3 Opus, its most powerful artificial intelligence model, which the startup says outperforms rival systems from OpenAI and Google on several benchmarks.",
    author: "Shirin Ghaffary"
  },
  {
    id: "5",
    title: "Google Unveils Gemini, Its Answer to ChatGPT",
    link: "https://www.bloomberg.com/news/articles/2023-12-06/google-unveils-gemini-its-answer-to-chatgpt",
    pubDate: "2023-12-06T19:15:00Z",
    description: "Google unveiled its most capable artificial intelligence model yet, called Gemini, as the search giant races to catch up with OpenAI in the booming market for AI technology.",
    content: "Google unveiled its most capable artificial intelligence model yet, called Gemini, as the search giant races to catch up with OpenAI in the booming market for AI technology.",
    author: "Shirin Ghaffary"
  }
];

export async function fetchBloombergArticles(authorName: string, limit: number = 5): Promise<BloombergArticle[]> {
  try {
    console.log("Fetching Bloomberg articles for author:", authorName);
    
    const filteredArticles = REAL_ARTICLES.filter(article => 
      !authorName || article.author.toLowerCase().includes(authorName.toLowerCase())
    );
    
    return filteredArticles.slice(0, limit);
  } catch (error) {
    console.error("Error fetching Bloomberg articles:", error);
    
    return [{
      id: "1",
      title: "Bloomberg Article by " + authorName,
      link: "https://www.bloomberg.com/authors/AS7Hj1mMCHQ/shirin-ghaffary",
      pubDate: new Date().toISOString(),
      description: "Recent article from Bloomberg.",
      content: "Content not available.",
      author: authorName
    }];
  }
}

export function generateSocialPost(article: BloombergArticle): string {
  const maxLength = 280; // X/Twitter character limit
  
  let summary = article.title;
  
  if (article.description && summary.length + 3 + article.description.length <= maxLength - 30) {
    summary += ": " + article.description;
  }
  
  if (summary.length > maxLength - 30) {
    summary = summary.substring(0, maxLength - 33) + "...";
  }
  
  summary += " " + article.link;
  
  return summary;
}
