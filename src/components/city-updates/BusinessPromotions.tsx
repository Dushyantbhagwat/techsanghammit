import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useCity } from '@/contexts/CityContext';
import { supabase } from '@/lib/supabase';
import { BusinessPromotion } from '@/types/business';
import { BusinessSubmissionForm } from './BusinessSubmissionForm';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Calendar, Tag, Globe, Phone, Mail } from 'lucide-react';
import { staticPromotions } from '@/data/staticPromotions';

export function BusinessPromotions() {
  const [promotions, setPromotions] = useState<BusinessPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCity } = useCity();

  useEffect(() => {
    loadPromotions();
  }, [selectedCity]);

  const loadPromotions = async () => {
    try {
      setLoading(true);

      // Try to get promotions from Supabase
      const { data, error: supabaseError } = await supabase
        .from('business_promotions')
        .select('*')
        .eq('city', selectedCity)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Transform Supabase data
      const transformedData: BusinessPromotion[] = (data || []).map(item => ({
        id: item.id,
        businessName: item.business_name,
        description: item.description,
        category: item.category,
        promotionType: item.promotion_type,
        startDate: item.start_date,
        endDate: item.end_date,
        address: item.address,
        location: {
          lat: parseFloat(item.location.split(',')[1].slice(0, -1)),
          lng: parseFloat(item.location.split(',')[0].slice(1))
        },
        contactInfo: item.contact_info,
        imageUrl: item.image_url,
        posterUrl: item.poster_url,
        city: item.city,
        featured: item.featured,
        created_at: item.created_at
      }));

      // If no promotions from Supabase, use static data
      if (transformedData.length === 0) {
        const staticCityPromotions = staticPromotions[selectedCity.toLowerCase()] || [];
        setPromotions(staticCityPromotions);
      } else {
        setPromotions(transformedData);
      }
    } catch (err) {
      // Silently fall back to static data
      const staticCityPromotions = staticPromotions[selectedCity.toLowerCase()] || [];
      setPromotions(staticCityPromotions);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionTypeColor = (type: BusinessPromotion['promotionType']) => {
    switch (type) {
      case 'DISCOUNT':
        return 'bg-green-500/10 text-green-500';
      case 'EVENT':
        return 'bg-blue-500/10 text-blue-500';
      case 'NEW_OPENING':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getPromotionTypeIcon = (type: BusinessPromotion['promotionType']) => {
    switch (type) {
      case 'DISCOUNT':
        return Tag;
      case 'EVENT':
        return Calendar;
      case 'NEW_OPENING':
        return Building2;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : promotions.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            No business promotions available in {selectedCity}
          </Card>
        ) : (
          promotions.map(promotion => {
            const PromotionIcon = getPromotionTypeIcon(promotion.promotionType);
            return (
              <Card key={promotion.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {promotion.posterUrl && (
                  <div className="w-full h-48 relative">
                    <img
                      src={promotion.posterUrl}
                      alt={`${promotion.businessName} promotion`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {promotion.imageUrl && (
                        <img
                          src={promotion.imageUrl}
                          alt={promotion.businessName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{promotion.businessName}</h3>
                        <p className="text-sm text-muted-foreground">{promotion.category}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getPromotionTypeColor(promotion.promotionType)}`}>
                      <PromotionIcon className="w-4 h-4" />
                      {promotion.promotionType}
                    </span>
                  </div>

                  <p className="mt-4 text-muted-foreground">{promotion.description}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{promotion.address}</p>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a
                        href={`tel:${promotion.contactInfo.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {promotion.contactInfo.phone}
                      </a>
                      <a
                        href={`mailto:${promotion.contactInfo.email}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {promotion.contactInfo.email}
                      </a>
                      {promotion.contactInfo.website && (
                        <a
                          href={promotion.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      <span className="ml-auto text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(promotion.created_at), { addSuffix: true })}
                      </span>
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