export interface BloombergArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  author: string;
}

export interface ArticleSummary {
  article: BloombergArticle;
  socialPost: string;
}
