
import { useCity } from '@/contexts/CityContext';
import NewsFeed from './NewsFeed';

export function CityUpdatesFeed() {
  const { selectedCity } = useCity();

  return (
    <div className="space-y-4">
      <NewsFeed city={selectedCity} />
    </div>
  );
}