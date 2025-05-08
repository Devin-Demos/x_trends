import axios from 'axios';

export interface BloombergArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  author: string;
}

export async function fetchBloombergArticles(authorName: string, limit: number = 5): Promise<BloombergArticle[]> {
  try {
    
    const mockArticles: BloombergArticle[] = [
      {
        id: '1',
        title: 'Tech Giants Face New Regulatory Challenges in EU',
        link: 'https://www.bloomberg.com/news/articles/2025-05-08/tech-giants-face-new-regulatory-challenges-in-eu',
        pubDate: '2025-05-08T10:30:00Z',
        description: 'European regulators are imposing stricter rules on major technology companies.',
        content: 'European regulators are imposing stricter rules on major technology companies, focusing on data privacy, competition, and content moderation. The new regulations aim to level the playing field and protect consumer rights in the digital economy.',
        author: 'Shirin Ghaffary'
      },
      {
        id: '2',
        title: 'AI Startups Secure Record Funding Despite Market Uncertainty',
        link: 'https://www.bloomberg.com/news/articles/2025-05-06/ai-startups-secure-record-funding-despite-market-uncertainty',
        pubDate: '2025-05-06T14:15:00Z',
        description: 'Venture capital continues to flow into artificial intelligence despite broader market concerns.',
        content: 'Venture capital continues to flow into artificial intelligence startups at record levels, despite broader market concerns about tech valuations. Investors are particularly interested in generative AI applications that can transform industries from healthcare to finance.',
        author: 'Shirin Ghaffary'
      },
      {
        id: '3',
        title: 'Social Media Companies Revamp Content Policies',
        link: 'https://www.bloomberg.com/news/articles/2025-05-04/social-media-companies-revamp-content-policies',
        pubDate: '2025-05-04T09:45:00Z',
        description: 'Major platforms are updating their approach to content moderation.',
        content: 'Major social media platforms are updating their approach to content moderation in response to growing public and regulatory pressure. The changes include more transparent appeals processes and increased human review of algorithmic decisions.',
        author: 'Shirin Ghaffary'
      },
      {
        id: '4',
        title: 'Remote Work Trends Reshape Corporate Real Estate',
        link: 'https://www.bloomberg.com/news/articles/2025-05-02/remote-work-trends-reshape-corporate-real-estate',
        pubDate: '2025-05-02T11:20:00Z',
        description: 'Companies are rethinking their office space needs as hybrid work becomes the norm.',
        content: 'Companies are rethinking their office space needs as hybrid work becomes the norm post-pandemic. Many are downsizing central headquarters while investing in smaller, distributed workspaces to accommodate flexible schedules and changing employee preferences.',
        author: 'Shirin Ghaffary'
      },
      {
        id: '5',
        title: 'Cybersecurity Spending Surges Amid Rising Threats',
        link: 'https://www.bloomberg.com/news/articles/2025-04-30/cybersecurity-spending-surges-amid-rising-threats',
        pubDate: '2025-04-30T13:10:00Z',
        description: 'Organizations are increasing their security budgets to combat sophisticated attacks.',
        content: 'Organizations are significantly increasing their cybersecurity budgets to combat increasingly sophisticated attacks. The focus is shifting from perimeter defense to zero-trust architectures and advanced threat detection, with AI playing a growing role in security operations.',
        author: 'Shirin Ghaffary'
      }
    ];
    
    return mockArticles
      .filter(article => !authorName || article.author.toLowerCase().includes(authorName.toLowerCase()))
      .slice(0, limit);
      
  } catch (error) {
    console.error("Error fetching Bloomberg articles:", error);
    throw error;
  }
}

export function generateSocialPost(article: BloombergArticle): string {
  
  const maxLength = 280; // X/Twitter character limit
  
  let summary = article.title;
  
  if (summary.length + 3 + article.description.length <= maxLength - 30) { // Leave room for the link
    summary += `: ${article.description}`;
  }
  
  if (summary.length > maxLength - 30) {
    summary = summary.substring(0, maxLength - 33) + '...';
  }
  
  summary += ` ${article.link}`;
  
  return summary;
}
