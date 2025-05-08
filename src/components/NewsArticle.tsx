import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Heart, Repeat, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleAuthor {
  id: string;
  name: string;
  username: string;
  profileImageUrl: string;
  verified: boolean;
}

interface ArticleMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
}

interface ArticleUrl {
  url: string;
  title: string;
  description: string;
}

export interface NewsArticleProps {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  source: string;
  author: ArticleAuthor;
  metrics: ArticleMetrics;
  url: string;
  urls: ArticleUrl[];
  images: string[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const NewsArticle: React.FC<NewsArticleProps> = ({
  title,
  content,
  publishedAt,
  author,
  metrics,
  url,
  urls,
  images
}) => {
  const formattedContent = content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < content.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author.profileImageUrl} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{author.name}</span>
              {author.verified && (
                <Badge variant="outline" className="ml-1 px-1 py-0 h-5">
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription className="mt-0">@{author.username}</CardDescription>
          </div>
        </div>
        <CardTitle className="mt-3 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground mb-4">
          {formattedContent}
        </div>
        
        {images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {images.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="rounded-md w-full h-auto object-cover"
                style={{ maxHeight: '300px' }}
              />
            ))}
          </div>
        )}
        
        {urls.length > 0 && (
          <div className="space-y-2 mt-2">
            {urls.map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 border rounded-md hover:bg-muted transition-colors"
              >
                <div className="font-medium">{link.title}</div>
                {link.description && (
                  <div className="text-sm text-muted-foreground mt-1">{link.description}</div>
                )}
              </a>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-4">
          {formatDate(publishedAt)}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="flex gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{formatNumber(metrics.like_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Repeat className="h-4 w-4" />
            <span>{formatNumber(metrics.retweet_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{formatNumber(metrics.reply_count)}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(url, '_blank')}
          className="text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          View on Twitter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsArticle;
