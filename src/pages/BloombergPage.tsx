import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/Layout';
import BloombergArticles from '../components/BloombergArticles';

const BloombergPage: React.FC = () => {
  const [authorName, setAuthorName] = useState<string>('Shirin Ghaffary');
  const [articleLimit, setArticleLimit] = useState<number>(5);
  const [searchSubmitted, setSearchSubmitted] = useState<boolean>(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSubmitted(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bloomberg Article Summaries</h1>
            <p className="text-muted-foreground">
              View recent Bloomberg articles and generate social media posts for X.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Author name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-32">
                  <Input
                    type="number"
                    placeholder="Limit"
                    min={1}
                    max={10}
                    value={articleLimit}
                    onChange={(e) => setArticleLimit(parseInt(e.target.value) || 5)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </CardContent>
          </Card>

          {searchSubmitted && (
            <BloombergArticles authorName={authorName} limit={articleLimit} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BloombergPage;
