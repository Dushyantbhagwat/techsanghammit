import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCity } from '@/contexts/CityContext';
import { supabase } from '@/lib/supabase';
import type { BusinessSubmission } from '@/types/business';

const CATEGORIES = [
  'Restaurant',
  'Retail',
  'Services',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other'
] as const;

const PROMOTION_TYPES = [
  { value: 'DISCOUNT', label: 'Special Discount' },
  { value: 'EVENT', label: 'Event or Sale' },
  { value: 'NEW_OPENING', label: 'New Opening' }
] as const;

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'panvel': { lat: 19.0337, lng: 73.1054 },
  'kharghar': { lat: 19.0475, lng: 73.0670 },
  'thane': { lat: 19.2183, lng: 72.9781 },
  'borivali': { lat: 19.2321, lng: 72.8567 },
  'nashik': { lat: 20.0059, lng: 73.7907 }
};

const initialFormState: BusinessSubmission = {
  businessName: '',
  description: '',
  category: CATEGORIES[0],
  promotionType: 'DISCOUNT',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  address: '',
  location: {
    lat: 0,
    lng: 0
  },
  contactInfo: {
    phone: '',
    email: '',
    website: ''
  },
  imageUrl: '',
  posterUrl: ''
};

export function BusinessSubmissionForm() {
  const { selectedCity } = useCity();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BusinessSubmission>(initialFormState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const cityCoords = CITY_COORDINATES[selectedCity.toLowerCase()] || { lat: 19.0760, lng: 72.8777 };

      const submissionData = {
        business_name: formData.businessName,
        description: formData.description,
        category: formData.category,
        promotion_type: formData.promotionType,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        address: formData.address,
        location: `(${cityCoords.lng},${cityCoords.lat})`,
        contact_info: formData.contactInfo,
        image_url: formData.imageUrl || null,
        poster_url: formData.posterUrl || null,
        city: selectedCity,
        featured: false
      };

      const { error: supabaseError } = await supabase
        .from('business_promotions')
        .insert(submissionData);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      setFormData(initialFormState);
    } catch (err) {
      setError('Failed to submit promotion. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Your Business Promotion</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-lg">
          Your promotion has been submitted successfully!
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Promotion Type</label>
            <select
              name="promotionType"
              value={formData.promotionType}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            >
              {PROMOTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contact Information</label>
            <div className="space-y-2">
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                required
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
              />
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
              />
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleInputChange}
                placeholder="Website (Optional)"
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Logo/Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.jpg"
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Promotional Poster URL (Optional)</label>
            <input
              type="url"
              name="posterUrl"
              value={formData.posterUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/poster.jpg"
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-background"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Add a promotional poster image to make your promotion stand out
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Promotion'}
        </Button>
      </form>
    </Card>
  );
}