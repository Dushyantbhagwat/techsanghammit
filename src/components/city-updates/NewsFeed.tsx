import React, { useState, useEffect } from 'react';
import { getNews, Article } from '../../services/news';

interface NewsFeedProps {
  city: string;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ city }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const newsArticles = await getNews(city, category);
      setArticles(newsArticles);
      setLoading(false);
    };
    fetchNews();
  }, [city, category]);

  return (
    <div className="p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Live News - {city.toUpperCase()}</h2>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => setCategory('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>All</button>
        <button onClick={() => setCategory('traffic')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'traffic' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Traffic</button>
        <button onClick={() => setCategory('event')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'event' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Events</button>
        <button onClick={() => setCategory('alert')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === 'alert' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Alerts</button>
      </div>
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article, index) => (
            <div key={index} className="bg-card text-card-foreground p-4 rounded-lg shadow-md border border-border">
              {article.urlToImage && <img src={article.urlToImage} alt={article.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{article.description}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">Read more</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;