export interface BusinessLocation {
  lat: number;
  lng: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface BusinessSubmission {
  businessName: string;
  description: string;
  category: string;
  promotionType: 'DISCOUNT' | 'EVENT' | 'NEW_OPENING';
  startDate: string;
  endDate: string;
  address: string;
  location: BusinessLocation;
  contactInfo: ContactInfo;
  imageUrl?: string;
  posterUrl?: string;  // Optional poster image
}

export interface BusinessPromotion extends BusinessSubmission {
  id: string;
  city: string;
  featured: boolean;
  created_at: string;
}