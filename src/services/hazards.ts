import { supabase, HAZARDS_BUCKET, HAZARDS_FOLDER_PATH, getImageUrl, getFullStoragePath, type HazardImage, type HazardReport } from '@/lib/supabase'

export interface HazardFilters {
  incidentType?: string
  severity?: string
  status?: string
  city?: string
  dateFrom?: string
  dateTo?: string
}

export interface HazardData {
  images: HazardImage[]
  reports: HazardReport[]
  totalCount: number
  filters: {
    incidentTypes: string[]
    severityLevels: string[]
    statusOptions: string[]
    cities: string[]
  }
}

// Fetch hazard images from Supabase storage subfolder
export const fetchHazardImages = async (limit: number = 50): Promise<HazardImage[]> => {
  try {
    console.log(`Fetching hazard images from bucket: ${HAZARDS_BUCKET}, folder: ${HAZARDS_FOLDER_PATH}`);

    const { data, error } = await supabase.storage
      .from(HAZARDS_BUCKET)
      .list(HAZARDS_FOLDER_PATH, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('Error fetching hazard images:', error)
      console.error('Error details:', {
        message: error.message,
        bucket: HAZARDS_BUCKET,
        folderPath: HAZARDS_FOLDER_PATH,
        limit
      });
      throw new Error(`Failed to fetch images from ${HAZARDS_FOLDER_PATH}: ${error.message}`)
    }

    if (!data) {
      console.warn('No data returned from storage.list()');
      return []
    }

    console.log(`Raw data from storage folder ${HAZARDS_FOLDER_PATH}:`, data);
    console.log(`Total files found in ${HAZARDS_FOLDER_PATH}: ${data.length}`);

    // Filter and log the filtering process
    const filteredFiles = data.filter(file => {
      // More permissive filtering - just exclude obvious non-images
      const hasName = file.name && file.name.trim() !== '';
      const notPlaceholder = !file.name?.includes('.emptyFolderPlaceholder');
      const notHidden = !file.name?.startsWith('.');

      // Don't filter by mimetype initially - let's see what we have
      const isValid = hasName && notPlaceholder && notHidden;

      if (!isValid) {
        console.log(`Filtering out file: ${file.name}, reason: ${!hasName ? 'no name' : !notPlaceholder ? 'placeholder' : 'hidden'}`);
      } else {
        console.log(`Including file: ${file.name}, mimetype: ${file.metadata?.mimetype}, size: ${file.metadata?.size}`);
      }

      return isValid;
    });

    console.log(`Valid image files after filtering: ${filteredFiles.length}`);

    // Transform the data and add public URLs
    const images: HazardImage[] = filteredFiles
      .map(file => {
        const publicUrl = getImageUrl(file.name);
        const fullStoragePath = getFullStoragePath(file.name);
        console.log(`Processing file: ${file.name}, Full path: ${fullStoragePath}, URL: ${publicUrl}`);

        return {
          id: file.id || file.name,
          name: file.name,
          url: publicUrl,
          metadata: file.metadata || {
            size: 0,
            mimetype: 'image/jpeg',
            lastModified: file.updated_at || file.created_at || new Date().toISOString()
          },
          created_at: file.created_at || new Date().toISOString(),
          updated_at: file.updated_at || new Date().toISOString(),
          last_accessed_at: file.last_accessed_at || new Date().toISOString(),
          // Add some mock custom metadata for demonstration
          customMetadata: generateMockMetadata(file.name)
        };
      })

    console.log(`Returning ${images.length} processed images`);
    return images
  } catch (error) {
    console.error('Error in fetchHazardImages:', error)
    console.error('Full error object:', error)
    throw error
  }
}

// Fetch hazard reports from database (if you have a reports table)
export const fetchHazardReports = async (filters?: HazardFilters): Promise<HazardReport[]> => {
  try {
    let query = supabase
      .from('hazard_reports')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (filters?.incidentType) {
      query = query.eq('incident_type', filters.incidentType)
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.city) {
      query = query.eq('city', filters.city)
    }
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching hazard reports:', error)
      // Return empty array if table doesn't exist yet
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchHazardReports:', error)
    // Return empty array if there's an error (table might not exist)
    return []
  }
}

// Fetch combined hazard data
export const fetchHazardData = async (filters?: HazardFilters): Promise<HazardData> => {
  try {
    const [images, reports] = await Promise.all([
      fetchHazardImages(100),
      fetchHazardReports(filters)
    ])

    // Extract filter options from the data
    const incidentTypes = [...new Set([
      ...images.map(img => img.customMetadata?.incidentType).filter(Boolean),
      ...reports.map(report => report.incident_type)
    ])] as string[]

    const severityLevels = ['low', 'medium', 'high', 'critical']
    const statusOptions = ['reported', 'investigating', 'resolved']
    
    const cities = [...new Set([
      ...images.map(img => img.customMetadata?.city).filter(Boolean),
      ...reports.map(report => report.city).filter(Boolean)
    ])] as string[]

    return {
      images,
      reports,
      totalCount: images.length + reports.length,
      filters: {
        incidentTypes,
        severityLevels,
        statusOptions,
        cities
      }
    }
  } catch (error) {
    console.error('Error fetching hazard data:', error)
    throw error
  }
}

// Generate mock metadata for demonstration purposes
const generateMockMetadata = (filename: string) => {
  const incidentTypes = [
    'Road Damage', 'Water Leak', 'Fallen Tree', 'Flooding', 'Air Pollution',
    'Waste Dumping', 'Infrastructure Damage', 'Traffic Hazard', 'Environmental Spill',
    'Power Line Issue', 'Sinkhole', 'Building Damage'
  ]
  
  const severities = ['low', 'medium', 'high', 'critical'] as const
  const statuses = ['reported', 'investigating', 'resolved'] as const
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad']

  // Generate consistent mock data based on filename
  const hash = filename.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)

  const randomIndex = (arr: any[]) => Math.abs(hash) % arr.length

  return {
    latitude: 19.0760 + (Math.abs(hash % 1000) / 10000), // Mumbai area coordinates
    longitude: 72.8777 + (Math.abs(hash % 1000) / 10000),
    incidentType: incidentTypes[randomIndex(incidentTypes)],
    description: `Reported incident requiring attention. Image: ${filename}`,
    reportedBy: `User${Math.abs(hash % 1000)}`,
    severity: severities[randomIndex(severities)],
    status: statuses[randomIndex(statuses)],
    address: `Street ${Math.abs(hash % 100)}, Area ${Math.abs(hash % 50)}`,
    city: cities[randomIndex(cities)]
  }
}
