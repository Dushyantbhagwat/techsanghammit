import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCity } from "@/contexts/CityContext";
import { fetchHazardData, type HazardData, type HazardFilters } from "@/services/hazards";
import { formatFileSize, getSeverityColor, getStatusColor } from "@/lib/supabase";
import { initializeSampleData } from "@/utils/sampleHazardData";
import { 
  ExclamationTriangleIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  EyeIcon,
  FunnelIcon,
  PhotoIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'severity' | 'type' | 'status';

export function HazardsAnalytics() {
  const { selectedCity } = useCity();
  const [hazardData, setHazardData] = useState<HazardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filters, setFilters] = useState<HazardFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const loadHazardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading hazard data...');
      console.log('Current filters:', filters);
      console.log('Selected city:', selectedCity);

      // Initialize sample data if needed
      console.log('🎯 Initializing sample data...');
      await initializeSampleData();

      console.log('📊 Fetching hazard data...');
      const data = await fetchHazardData(filters);

      console.log('✅ Hazard data loaded:', {
        totalImages: data.images.length,
        totalReports: data.reports.length,
        totalCount: data.totalCount,
        filters: data.filters
      });

      setHazardData(data);
    } catch (err) {
      console.error('❌ Error loading hazard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hazard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHazardData();
  }, [selectedCity, filters]);

  const handleFilterChange = (key: keyof HazardFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getSortedImages = () => {
    if (!hazardData) return [];
    
    const images = [...hazardData.images];
    
    switch (sortBy) {
      case 'date':
        return images.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return images.sort((a, b) => {
          const aSeverity = severityOrder[a.customMetadata?.severity as keyof typeof severityOrder] || 0;
          const bSeverity = severityOrder[b.customMetadata?.severity as keyof typeof severityOrder] || 0;
          return bSeverity - aSeverity;
        });
      case 'type':
        return images.sort((a, b) => (a.customMetadata?.incidentType || '').localeCompare(b.customMetadata?.incidentType || ''));
      case 'status':
        return images.sort((a, b) => (a.customMetadata?.status || '').localeCompare(b.customMetadata?.status || ''));
      default:
        return images;
    }
  };

  const getFilteredImages = () => {
    const sortedImages = getSortedImages();
    
    return sortedImages.filter(image => {
      const metadata = image.customMetadata;
      if (!metadata) return true;
      
      if (filters.incidentType && metadata.incidentType !== filters.incidentType) return false;
      if (filters.severity && metadata.severity !== filters.severity) return false;
      if (filters.status && metadata.status !== filters.status) return false;
      if (filters.city && metadata.city !== filters.city) return false;
      
      return true;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-300">Loading Hazard Reports</div>
          <div className="text-sm text-gray-500 mt-1">Fetching geotagged incident images...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Hazard Data</h3>
              <p className="text-red-300 text-sm leading-relaxed mb-4">{error}</p>
              <button
                onClick={loadHazardData}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Retry Loading
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!hazardData || hazardData.images.length === 0) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">No Hazard Reports</h3>
              <p className="text-blue-300 text-sm leading-relaxed">No hazard images have been reported yet for this location.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const filteredImages = getFilteredImages();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hazards & Incidents</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Geotagged incident reports and environmental hazards for {selectedCity?.charAt(0).toUpperCase() + selectedCity?.slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <CameraIcon className="h-3 w-3 mr-1" />
            {hazardData.totalCount} Reports
          </Badge>
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-xs"
            >
              <PhotoIcon className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-xs"
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              List
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['date', 'severity', 'type', 'status'] as SortBy[]).map((sort) => (
              <Button
                key={sort}
                variant={sortBy === sort ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(sort)}
                className="text-xs capitalize"
              >
                {sort}
              </Button>
            ))}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {Object.keys(filters).length > 0 && (
              <Badge variant="secondary" className="text-xs ml-1">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredImages.length} of {hazardData.images.length} reports
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Incident Type Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Incident Type
              </label>
              <select
                value={filters.incidentType || 'all'}
                onChange={(e) => handleFilterChange('incidentType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                {hazardData.filters.incidentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Severity
              </label>
              <select
                value={filters.severity || 'all'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Severities</option>
                {hazardData.filters.severityLevels.map(severity => (
                  <option key={severity} value={severity} className="capitalize">{severity}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Status
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Statuses</option>
                {hazardData.filters.statusOptions.map(status => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                City
              </label>
              <select
                value={filters.city || 'all'}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Cities</option>
                {hazardData.filters.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Images Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <HazardImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredImages.map((image) => (
            <HazardImageListItem key={image.id} image={image} />
          ))}
        </div>
      )}

      {filteredImages.length === 0 && (
        <Card className="p-8 text-center">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reports Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No hazard reports match your current filters. Try adjusting your search criteria.
          </p>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card className="p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{hazardData.images.length}</div>
            <div className="text-sm text-gray-400">Total Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {hazardData.images.filter(img => img.customMetadata?.severity === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {hazardData.images.filter(img => img.customMetadata?.status === 'investigating').length}
            </div>
            <div className="text-sm text-gray-400">Under Investigation</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {hazardData.images.filter(img => img.customMetadata?.status === 'resolved').length}
            </div>
            <div className="text-sm text-gray-400">Resolved</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Individual Image Card Component for Grid View
function HazardImageCard({ image }: { image: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const metadata = image.customMetadata;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Failed to load image</p>
            </div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={metadata?.description || 'Hazard report'}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Severity Badge */}
        {metadata?.severity && (
          <Badge
            variant="secondary"
            className={`absolute top-2 right-2 text-xs ${getSeverityColor(metadata.severity)} bg-black/50 backdrop-blur-sm`}
          >
            {metadata.severity.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Incident Type */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {metadata?.incidentType || 'Unknown Incident'}
          </h3>
          {metadata?.status && (
            <Badge variant="outline" className={`text-xs ${getStatusColor(metadata.status)}`}>
              {metadata.status}
            </Badge>
          )}
        </div>

        {/* Location */}
        {(metadata?.latitude && metadata?.longitude) && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPinIcon className="h-3 w-3" />
            <span>{metadata.latitude.toFixed(4)}, {metadata.longitude.toFixed(4)}</span>
          </div>
        )}

        {/* Address */}
        {metadata?.address && (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {metadata.address}, {metadata.city}
          </p>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <ClockIcon className="h-3 w-3" />
          <span>{new Date(image.created_at).toLocaleDateString()}</span>
        </div>

        {/* Description */}
        {metadata?.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {metadata.description}
          </p>
        )}
      </div>
    </Card>
  );
}

// Individual Image List Item Component for List View
function HazardImageListItem({ image }: { image: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const metadata = image.customMetadata;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex gap-4">
        {/* Image Thumbnail */}
        <div className="relative w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={image.url}
              alt={metadata?.description || 'Hazard report'}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {metadata?.incidentType || 'Unknown Incident'}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {metadata?.severity && (
                <Badge variant="secondary" className={`text-xs ${getSeverityColor(metadata.severity)}`}>
                  {metadata.severity.toUpperCase()}
                </Badge>
              )}
              {metadata?.status && (
                <Badge variant="outline" className={`text-xs ${getStatusColor(metadata.status)}`}>
                  {metadata.status}
                </Badge>
              )}
            </div>
          </div>

          {metadata?.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {metadata.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {(metadata?.latitude && metadata?.longitude) && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-3 w-3" />
                <span>{metadata.latitude.toFixed(4)}, {metadata.longitude.toFixed(4)}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>{new Date(image.created_at).toLocaleDateString()}</span>
            </div>

            {metadata?.reportedBy && (
              <div className="flex items-center gap-1">
                <span>Reported by: {metadata.reportedBy}</span>
              </div>
            )}
          </div>

          {metadata?.address && (
            <p className="text-xs text-gray-500">
              📍 {metadata.address}, {metadata.city}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
