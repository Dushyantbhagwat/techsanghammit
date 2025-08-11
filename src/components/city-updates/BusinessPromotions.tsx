import { useState, useEffect } from 'react';
import { BusinessPromotion } from '@/types/business';
import { useCity } from '@/contexts/CityContext';
import { staticPromotions } from '@/data/staticPromotions';
import { format } from 'date-fns';

export function BusinessPromotions() {
  const [promotions, setPromotions] = useState<BusinessPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCity } = useCity();

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Filter promotions by city
        const cityPromotions = staticPromotions.filter(
          (promo: BusinessPromotion) => promo.city.toLowerCase() === selectedCity.toLowerCase()
        );
        
        setPromotions(cityPromotions);
      } catch (err) {
        console.error('Error loading promotions:', err);
        setError('Failed to load business promotions');
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, [selectedCity]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded">
        {error}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No business promotions available for {selectedCity}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {promotions.map((promotion) => (
        <div
          key={promotion.id}
          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">{promotion.businessName}</h3>
          <p className="text-gray-600 mb-4">{promotion.description}</p>
          <div className="text-sm text-gray-500 mb-2">
            <div>Start: {format(new Date(promotion.startDate), 'MMM dd, yyyy')}</div>
            <div>End: {format(new Date(promotion.endDate), 'MMM dd, yyyy')}</div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-500">{promotion.promotionType}</span>
            <span className="text-gray-500">{promotion.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}