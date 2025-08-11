
import { useState, useEffect } from 'react';
import { NewsArticle, newsService } from '@/services/news';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCity } from '@/contexts/CityContext';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Calendar, Car } from 'lucide-react';

const CATEGORIES = ['ALL', 'TRAFFIC', 'EVENT', 'ALERT'] as const;
type Category = (typeof CATEGORIES)[number];

const CategoryIcon = {
  TRAFFIC: Car,
  EVENT: Calendar,
  ALERT: AlertTriangle,
  GENERAL: Calendar
};

export function CityUpdatesFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    loadNews();
  }, [selectedCity, activeCategory]);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsService.getCityNews(
        selectedCity,
        activeCategory === 'ALL' ? undefined : activeCategory
      );
      setNews(data);
    } catch (error) {
      console.error('Failed to load news:', error);
      setError('Failed to load news updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNews();
  };

  const handleOpenArticle = (link: string) => {
    if (link !== '#') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const getCategoryColor = (category: NewsArticle['category']) => {
    switch (category) {
      case 'TRAFFIC':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'EVENT':
        return 'bg-green-500/10 text-green-500';
      case 'ALERT':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Updates - {selectedCity.toUpperCase()}</h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="ALL" value={activeCategory} onValueChange={(value) => setActiveCategory(value as Category)}>
        <TabsList className="w-full justify-start bg-background border-b">
          {CATEGORIES.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:border-primary data-[state=active]:bg-primary/10"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-red-500">
            {error}
          </Card>
        ) : news.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No updates available for this category
          </Card>
        ) : (
          news.map(article => {
            const Icon = CategoryIcon[article.category];
            return (
              <Card 
                key={article.id} 
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleOpenArticle(article.link)}
              >
                <div className="flex gap-4">
                  {article.imageUrl ? (
                    <div className="flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 whitespace-nowrap ${getCategoryColor(article.category)}`}>
                        <Icon className="w-4 h-4" />
                        {article.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}</span>
                      <span className="font-medium">{article.source}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}