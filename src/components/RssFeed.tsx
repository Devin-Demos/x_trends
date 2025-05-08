import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Rss, ExternalLink } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

const RssFeed: React.FC = () => {
  const apiBaseUrl = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL 
    : 'http://localhost:3001';
  const rssUrl = `${apiBaseUrl}/api/rss`;
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(rssUrl).then(() => {
      toast({
        title: "URL copied",
        description: "RSS feed URL copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800 flex items-center">
          <Rss className="mr-2 h-5 w-5" /> AI News RSS Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Subscribe to our AI News RSS feed to get the latest updates about artificial intelligence from Twitter/X.
        </p>
        <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
          {rssUrl}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleCopyUrl}
          className="w-full sm:w-auto"
        >
          Copy RSS URL
        </Button>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={() => window.open(rssUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Open Feed
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RssFeed;
