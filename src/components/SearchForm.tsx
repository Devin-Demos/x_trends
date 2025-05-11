
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Search, Calendar } from 'lucide-react';
import { SearchFormData } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [topicName, setTopicName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [maxResults, setMaxResults] = useState(100);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topicName.trim()) {
      toast({
        title: "Topic name required",
        description: "Please enter a name for this topic.",
        variant: "destructive",
      });
      return;
    }

    if (!keywords.trim()) {
      toast({
        title: "Keywords required",
        description: "Please enter at least one keyword to search for.",
        variant: "destructive",
      });
      return;
    }

    onSearch({
      topicName: topicName.trim(),
      keywords: keywords.trim(),
      options: {
        maxResults,
        startTime: startDate ? formatDateForTwitter(startDate) : undefined,
        endTime: endDate ? formatDateForTwitter(endDate) : undefined,
      }
    });
  };

  // Format date for Twitter API (ISO 8601 format)
  const formatDateForTwitter = (date: Date): string => {
    return date.toISOString();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-brand-800">Search X Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topicName">Topic Name</Label>
            <Input
              id="topicName"
              placeholder="e.g. Climate Change"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">A descriptive name for your topic of interest</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Textarea
              id="keywords"
              placeholder="e.g. climate crisis, global warming, climate action"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">Enter related terms to broaden your search</p>
          </div>
          
          <div className="flex items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm"
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="maxResults">Maximum Results</Label>
                <Input
                  id="maxResults"
                  type="number"
                  min={10}
                  max={100}
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">Number of tweets to retrieve (10-100)</p>
              </div>
              
              <div className="grid gap-2">
                <Label>Date Range (optional)</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Limit search to a specific timeframe (X API allows up to 7 days back)
                </p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full sm:w-auto bg-brand-700 hover:bg-brand-800"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Search Twitter
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SearchForm;
