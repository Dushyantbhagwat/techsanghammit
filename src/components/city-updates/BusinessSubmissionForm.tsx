import { useState } from 'react';
import { useCity } from '@/contexts/CityContext';
import type { BusinessSubmission } from '@/types/business';

export function BusinessSubmissionForm() {
  const { selectedCity } = useCity();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);
      setError(null);

      // Create submission object
      const submission: BusinessSubmission = {
        businessName: formData.get('businessName') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        promotionType: formData.get('promotionType') as 'DISCOUNT' | 'EVENT' | 'NEW_OPENING',
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        address: formData.get('address') as string,
        location: {
          lat: parseFloat(formData.get('lat') as string),
          lng: parseFloat(formData.get('lng') as string)
        },
        contactInfo: {
          phone: formData.get('phone') as string,
          email: formData.get('email') as string,
          website: formData.get('website') as string || undefined
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Submission received:', submission);
      setSuccess(true);
      form.reset();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit business promotion');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded">
        Your business promotion has been submitted successfully! (Demo Mode)
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium">
            Business Name
          </label>
          <input
            type="text"
            name="businessName"
            id="businessName"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            required
            rows={3}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category
          </label>
          <select
            name="category"
            id="category"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="Retail">Retail</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Services">Services</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="promotionType" className="block text-sm font-medium">
            Promotion Type
          </label>
          <select
            name="promotionType"
            id="promotionType"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          >
            <option value="DISCOUNT">Discount</option>
            <option value="EVENT">Event</option>
            <option value="NEW_OPENING">New Opening</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="lat"
              id="lat"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="lng" className="block text-sm font-medium">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="lng"
              id="lng"
              required
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium">
            Website (optional)
          </label>
          <input
            type="url"
            name="website"
            id="website"
            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Promotion'}
        </button>
      </div>
    </form>
  );
}