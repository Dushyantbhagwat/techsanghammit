import { supabase } from '@/lib/supabase';

export interface CityUpdate {
  id: string;
  title: string;
  description: string;
  category: 'TRAFFIC' | 'EVENT' | 'ALERT';
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  upvotes: number;
}

export interface BusinessPromotion {
  id: string;
  businessName: string;
  description: string;
  category: string;
  promotionType: 'DISCOUNT' | 'EVENT' | 'NEW_OPENING';
  startDate: Date;
  endDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  featured: boolean;
  imageUrl?: string;
}

export const cityUpdatesService = {
  async getCityUpdates(category?: string): Promise<CityUpdate[]> {
    let query = supabase.from('city_updates').select('*');
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query.order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBusinessPromotions(featured?: boolean): Promise<BusinessPromotion[]> {
    let query = supabase.from('business_promotions').select('*');
    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }
    const { data, error } = await query.order('startDate', { ascending: true });
    if (error) throw error;
    return data;
  },

  async upvoteUpdate(updateId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_upvotes', { update_id: updateId });
    if (error) throw error;
  },

  async submitBusinessPromotion(promotion: Omit<BusinessPromotion, 'id'>): Promise<void> {
    const { error } = await supabase.from('business_promotions').insert(promotion);
    if (error) throw error;
  },

  async getLocalPromotions(lat: number, lng: number, radiusKm: number): Promise<BusinessPromotion[]> {
    const { data, error } = await supabase.rpc('get_nearby_promotions', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm
    });
    if (error) throw error;
    return data;
  }
};