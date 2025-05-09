import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BloombergArticle, ArticleSummary } from '../types/bloomberg';
import { fetchBloombergArticles, generateSocialPost } from '../utils/bloombergApi';
import { Clipboard, Share2 } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

interface BloombergArticlesProps {
  authorName: string;
  limit?: number;
}

const BloombergArticles: React.FC<BloombergArticlesProps> = ({ authorName, limit = 5 }) => {
  const [articles, setArticles] = useState<BloombergArticle[]>([]);
  const [summaries, setSummaries] = useState<ArticleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const fetchedArticles = await fetchBloombergArticles(authorName, limit);
        setArticles(fetchedArticles);
        
        const generatedSummaries = fetchedArticles.map(article => ({
          article,
          socialPost: generateSocialPost(article)
        }));
        setSummaries(generatedSummaries);
      } catch (err) {
        console.error('Error loading articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticles();
  }, [authorName, limit]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The social media post has been copied to your clipboard.",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">Loading articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-muted p-4 rounded-md">
        <p className="text-muted-foreground">No articles found for {authorName}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Latest Articles by {authorName}
      </h2>
      
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="social">Social Media Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles" className="space-y-4 mt-4">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {article.title}
                  </a>
                </CardTitle>
                <CardDescription>
                  Published on {new Date(article.pubDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{article.description}</p>
                {article.content && (
                  <>
                    <Separator className="my-4" />
                    <p>{article.content}</p>
                  </>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 flex justify-between">
                <span className="text-sm text-muted-foreground">By {article.author}</span>
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Read on Bloomberg
                </a>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="social" className="space-y-4 mt-4">
          {summaries.map((summary) => (
            <Card key={summary.article.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Social Media Post for "{summary.article.title}"
                </CardTitle>
                <CardDescription>
                  {summary.socialPost.length} characters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{summary.socialPost}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(summary.socialPost)}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(summary.socialPost)}`, '_blank');
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share on X
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloombergArticles;
