import { supabase, HAZARDS_BUCKET, HAZARDS_FOLDER_PATH, getFullStoragePath } from '@/lib/supabase';

// Sample hazard data for demonstration
export const sampleHazardImages = [
  {
    name: 'road_damage_mumbai_001.jpg',
    description: 'Large pothole causing traffic disruption on main road',
    incidentType: 'Road Damage',
    severity: 'high' as const,
    status: 'reported' as const,
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Marine Drive, Fort',
    city: 'Mumbai',
    reportedBy: 'User123'
  },
  {
    name: 'water_leak_pune_002.jpg',
    description: 'Water main burst flooding residential street',
    incidentType: 'Water Leak',
    severity: 'critical' as const,
    status: 'investigating' as const,
    latitude: 18.5204,
    longitude: 73.8567,
    address: 'FC Road, Shivajinagar',
    city: 'Pune',
    reportedBy: 'User456'
  },
  {
    name: 'fallen_tree_bangalore_003.jpg',
    description: 'Tree fallen across road blocking traffic after storm',
    incidentType: 'Fallen Tree',
    severity: 'medium' as const,
    status: 'resolved' as const,
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'MG Road, Central Bangalore',
    city: 'Bangalore',
    reportedBy: 'User789'
  },
  {
    name: 'flooding_chennai_004.jpg',
    description: 'Street flooding due to blocked drainage system',
    incidentType: 'Flooding',
    severity: 'high' as const,
    status: 'investigating' as const,
    latitude: 13.0827,
    longitude: 80.2707,
    address: 'Anna Salai, Thousand Lights',
    city: 'Chennai',
    reportedBy: 'User101'
  },
  {
    name: 'air_pollution_delhi_005.jpg',
    description: 'Heavy smog and air pollution in commercial area',
    incidentType: 'Air Pollution',
    severity: 'critical' as const,
    status: 'reported' as const,
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Connaught Place, Central Delhi',
    city: 'Delhi',
    reportedBy: 'User202'
  },
  {
    name: 'waste_dumping_kolkata_006.jpg',
    description: 'Illegal waste dumping in public area',
    incidentType: 'Waste Dumping',
    severity: 'medium' as const,
    status: 'reported' as const,
    latitude: 22.5726,
    longitude: 88.3639,
    address: 'Park Street, Central Kolkata',
    city: 'Kolkata',
    reportedBy: 'User303'
  },
  {
    name: 'infrastructure_damage_hyderabad_007.jpg',
    description: 'Damaged bridge railing poses safety risk',
    incidentType: 'Infrastructure Damage',
    severity: 'high' as const,
    status: 'investigating' as const,
    latitude: 17.3850,
    longitude: 78.4867,
    address: 'Tank Bund Road, Secunderabad',
    city: 'Hyderabad',
    reportedBy: 'User404'
  },
  {
    name: 'traffic_hazard_mumbai_008.jpg',
    description: 'Broken traffic signal causing confusion',
    incidentType: 'Traffic Hazard',
    severity: 'medium' as const,
    status: 'resolved' as const,
    latitude: 19.0596,
    longitude: 72.8295,
    address: 'Linking Road, Bandra West',
    city: 'Mumbai',
    reportedBy: 'User505'
  },
  {
    name: 'environmental_spill_pune_009.jpg',
    description: 'Chemical spill from industrial area affecting nearby water body',
    incidentType: 'Environmental Spill',
    severity: 'critical' as const,
    status: 'investigating' as const,
    latitude: 18.5679,
    longitude: 73.9143,
    address: 'Pimpri Industrial Area',
    city: 'Pune',
    reportedBy: 'User606'
  },
  {
    name: 'power_line_issue_bangalore_010.jpg',
    description: 'Damaged power lines hanging dangerously low',
    incidentType: 'Power Line Issue',
    severity: 'critical' as const,
    status: 'reported' as const,
    latitude: 12.9352,
    longitude: 77.6245,
    address: 'Whitefield Main Road',
    city: 'Bangalore',
    reportedBy: 'User707'
  }
];

// Function to create sample placeholder images
export const createSampleImages = async () => {
  try {
    console.log(`Creating sample hazard images in folder: ${HAZARDS_FOLDER_PATH}...`);

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === HAZARDS_BUCKET);

    if (!bucketExists) {
      console.log(`Bucket '${HAZARDS_BUCKET}' not found. Please ensure the bucket exists.`);
      return;
    }

    console.log(`Using existing bucket '${HAZARDS_BUCKET}' with folder path '${HAZARDS_FOLDER_PATH}'`);
    
    // Create placeholder images for each sample
    for (const sample of sampleHazardImages) {
      try {
        // Create a simple colored canvas as placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Set background color based on severity
          const colors = {
            low: '#10b981',
            medium: '#f59e0b', 
            high: '#ef4444',
            critical: '#dc2626'
          };
          
          ctx.fillStyle = colors[sample.severity];
          ctx.fillRect(0, 0, 400, 300);
          
          // Add text
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(sample.incidentType, 200, 150);
          ctx.font = '12px Arial';
          ctx.fillText(sample.city, 200, 180);
          ctx.fillText(sample.severity.toUpperCase(), 200, 200);
        }
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        });
        
        // Upload to Supabase with full folder path
        const fullPath = getFullStoragePath(sample.name);
        const { error: uploadError } = await supabase.storage
          .from(HAZARDS_BUCKET)
          .upload(fullPath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg'
          });
        
        if (uploadError) {
          console.error(`Error uploading ${sample.name} to ${fullPath}:`, uploadError);
        } else {
          console.log(`Uploaded ${sample.name} to ${fullPath}`);
        }
        
      } catch (error) {
        console.error(`Error creating sample image ${sample.name}:`, error);
      }
    }
    
    console.log('Sample images creation completed');
    
  } catch (error) {
    console.error('Error in createSampleImages:', error);
  }
};

// Function to check if sample images exist
export const checkSampleImagesExist = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from(HAZARDS_BUCKET)
      .list(HAZARDS_FOLDER_PATH, { limit: 1 });

    if (error) {
      console.error('Error checking sample images in folder:', error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    console.error('Error in checkSampleImagesExist:', error);
    return false;
  }
};

// Function to initialize sample data if needed
export const initializeSampleData = async () => {
  const exists = await checkSampleImagesExist();
  if (!exists) {
    await createSampleImages();
  }
};
