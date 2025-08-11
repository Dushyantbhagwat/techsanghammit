import { BusinessPromotion } from '@/types/business';

export const staticPromotions: BusinessPromotion[] = [
  {
    id: '1',
    businessName: 'City Mall',
    description: 'Grand Opening Sale - Up to 50% off on all items',
    category: 'Retail',
    promotionType: 'NEW_OPENING',
    startDate: '2025-03-27',
    endDate: '2025-04-27',
    address: '123 Main Street, Thane',
    location: { lat: 19.2183, lng: 72.9781 },
    contactInfo: {
      phone: '+91 98765 43210',
      email: 'info@citymall.com',
      website: 'www.citymall.com'
    },
    city: 'thane',
    featured: true,
    created_at: '2025-03-27T00:00:00Z'
  },
  {
    id: '2',
    businessName: 'Tech Hub',
    description: 'Special discounts on all electronics',
    category: 'Electronics',
    promotionType: 'DISCOUNT',
    startDate: '2025-03-27',
    endDate: '2025-04-15',
    address: '456 Tech Park, Borivali',
    location: { lat: 19.2307, lng: 72.8567 },
    contactInfo: {
      phone: '+91 98765 43211',
      email: 'sales@techhub.com'
    },
    city: 'borivali',
    featured: false,
    created_at: '2025-03-27T00:00:00Z'
  },
  {
    id: '3',
    businessName: 'Food Festival',
    description: 'Annual Food Festival with live music',
    category: 'Food & Beverage',
    promotionType: 'EVENT',
    startDate: '2025-04-01',
    endDate: '2025-04-03',
    address: '789 Park Road, Pune',
    location: { lat: 18.5204, lng: 73.8567 },
    contactInfo: {
      phone: '+91 98765 43212',
      email: 'info@foodfest.com',
      website: 'www.foodfest.com'
    },
    city: 'pune',
    featured: true,
    created_at: '2025-03-27T00:00:00Z'
  }
];