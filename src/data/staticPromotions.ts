import { BusinessPromotion } from '@/types/business';

export const staticPromotions: Record<string, BusinessPromotion[]> = {
  'panvel': [
    {
      id: 'panvel-1',
      businessName: 'Food Plaza Restaurant',
      description: 'Grand opening special! Get 20% off on all main course dishes. Experience authentic Indian cuisine in a modern setting.',
      category: 'Restaurant',
      promotionType: 'NEW_OPENING',
      startDate: '2025-03-27',
      endDate: '2025-04-27',
      address: 'Shop 12, New Market, Sector 5, Panvel',
      location: { lat: 19.0337, lng: 73.1054 },
      contactInfo: {
        phone: '022-27452365',
        email: 'info@foodplaza.com',
        website: 'https://foodplaza.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      posterUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092',
      city: 'Panvel',
      featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'panvel-2',
      businessName: 'SmartTech Electronics',
      description: 'Mega Electronics Sale! Up to 50% off on smartphones, laptops, and accessories. EMI options available.',
      category: 'Retail',
      promotionType: 'DISCOUNT',
      startDate: '2025-03-25',
      endDate: '2025-04-10',
      address: 'Crystal Plaza, Near Station, Panvel West',
      location: { lat: 19.0337, lng: 73.1054 },
      contactInfo: {
        phone: '022-27456789',
        email: 'sales@smarttech.com',
        website: 'https://smarttech.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
      posterUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece',
      city: 'Panvel',
      featured: false,
      created_at: new Date().toISOString()
    }
  ],
  'kharghar': [
    {
      id: 'kharghar-1',
      businessName: 'Fitness First Gym',
      description: 'Summer Body Challenge! Join now and get 3 months free with annual membership. Personal trainer consultation included.',
      category: 'Healthcare',
      promotionType: 'EVENT',
      startDate: '2025-04-01',
      endDate: '2025-04-30',
      address: 'Central Plaza, Sector 7, Kharghar',
      location: { lat: 19.0475, lng: 73.0670 },
      contactInfo: {
        phone: '022-27890123',
        email: 'join@fitnessfirst.com',
        website: 'https://fitnessfirst.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      posterUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c',
      city: 'Kharghar',
      featured: true,
      created_at: new Date().toISOString()
    }
  ],
  'thane': [
    {
      id: 'thane-1',
      businessName: 'Urban Fashion Hub',
      description: 'End of Season Sale! Minimum 30% off on all branded clothing. Additional 10% off on shopping above ₹5000.',
      category: 'Retail',
      promotionType: 'DISCOUNT',
      startDate: '2025-03-20',
      endDate: '2025-04-15',
      address: 'Lake City Mall, Thane West',
      location: { lat: 19.2183, lng: 72.9781 },
      contactInfo: {
        phone: '022-25789012',
        email: 'contact@urbanfashion.com',
        website: 'https://urbanfashion.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
      posterUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
      city: 'Thane',
      featured: true,
      created_at: new Date().toISOString()
    }
  ],
  'borivali': [
    {
      id: 'borivali-1',
      businessName: 'Cafe Wonderland',
      description: 'Weekend Special! Buy any coffee and get a dessert free. Live music every Saturday evening.',
      category: 'Restaurant',
      promotionType: 'EVENT',
      startDate: '2025-03-28',
      endDate: '2025-04-30',
      address: 'Shop 3, Wonder Mall, Borivali West',
      location: { lat: 19.2321, lng: 72.8567 },
      contactInfo: {
        phone: '022-28901234',
        email: 'hello@cafewonderland.com',
        website: 'https://cafewonderland.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
      posterUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
      city: 'Borivali',
      featured: false,
      created_at: new Date().toISOString()
    }
  ],
  'nashik': [
    {
      id: 'nashik-1',
      businessName: 'Wine Valley Resort',
      description: 'Wine Tasting Festival! Experience the finest wines from local vineyards. Special packages for couples.',
      category: 'Entertainment',
      promotionType: 'EVENT',
      startDate: '2025-04-05',
      endDate: '2025-04-07',
      address: 'Wine Valley Road, Nashik',
      location: { lat: 20.0059, lng: 73.7907 },
      contactInfo: {
        phone: '0253-2345678',
        email: 'events@winevalley.com',
        website: 'https://winevalley.com'
      },
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
      posterUrl: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7',
      city: 'Nashik',
      featured: true,
      created_at: new Date().toISOString()
    }
  ]
};