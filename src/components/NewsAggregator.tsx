import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import NewsArticle, { NewsArticleProps } from './NewsArticle';

interface NewsResponse {
  articles: NewsArticleProps[];
  meta: {
    cached: boolean;
    timestamp: number;
  };
}

const NewsAggregator: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticleProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const apiBaseUrl = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL 
    : 'http://localhost:3001';

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/news`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch AI news');
      }
      
      const data: NewsResponse = await response.json();
      setArticles(data.articles);
      setLastUpdated(new Date());
      
      if (data.meta.cached) {
        toast({
          title: "Using cached data",
          description: "Showing cached AI news to avoid API rate limits",
        });
      } else {
        toast({
          title: "News updated",
          description: "Latest AI news has been fetched",
        });
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch AI news',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleRefresh = () => {
    fetchNews();
  };
  
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(lastUpdated);
  };
  
  const filteredArticles = articles.filter(article => {
    if (activeTab === 'all') return true;
    
    const keywords = {
      'llm': ['llm', 'large language model', 'gpt', 'chatgpt', 'claude', 'gemini', 'language model'],
      'vision': ['computer vision', 'image generation', 'dalle', 'midjourney', 'stable diffusion'],
      'research': ['research', 'paper', 'study', 'published', 'conference']
    };
    
    const content = article.content.toLowerCase();
    return keywords[activeTab as keyof typeof keywords].some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  });
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold flex items-center">
          <Newspaper className="mr-2 h-6 w-6" /> AI News
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated: {formatLastUpdated()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="llm">LLMs</TabsTrigger>
            <TabsTrigger value="vision">Vision/Gen</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-full mt-3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-4/6 mb-4" />
                  <Skeleton className="h-32 w-full rounded-md mb-4" />
                  <Skeleton className="h-3 w-20 mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <NewsArticle key={article.id} {...article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No AI news articles found for this category.</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsAggregator;
