import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TopicCreate } from '../types';
import { X } from 'lucide-react';

interface TopicFormProps {
  onSubmit: (topic: TopicCreate) => void;
  initialTopic?: TopicCreate;
  buttonText?: string;
}

export function TopicForm({ onSubmit, initialTopic, buttonText = 'Create Topic' }: TopicFormProps) {
  const [name, setName] = useState(initialTopic?.name || '');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>(initialTopic?.keywords || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && keywords.length > 0) {
      onSubmit({ name, keywords });
      if (!initialTopic) {
        setName('');
        setKeywords([]);
      }
    }
  };

  const addKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialTopic ? 'Edit Topic' : 'Create New Topic'}</CardTitle>
        <CardDescription>
          {initialTopic 
            ? 'Update the topic name and keywords' 
            : 'Define a new topic to track on Twitter'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Topic Name</Label>
            <Input
              id="name"
              placeholder="e.g., Climate Change"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keyword">Keywords</Label>
            <div className="flex space-x-2">
              <Input
                id="keyword"
                placeholder="e.g., global warming"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Button type="button" onClick={addKeyword} variant="secondary">
                Add
              </Button>
            </div>
          </div>
          
          {keywords.length > 0 && (
            <div className="space-y-2">
              <Label>Current Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                  >
                    <span>{kw}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeKeyword(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!name.trim() || keywords.length === 0}>
            {buttonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
