import { supabase, HAZARDS_BUCKET, HAZARDS_FOLDER_PATH, getImageUrl } from '@/lib/supabase';

// Utility functions for testing the Hazards component

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Available buckets:', data?.map(b => b.name));
    
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

export const testHazardsBucket = async (): Promise<boolean> => {
  try {
    console.log(`Testing hazards folder: ${HAZARDS_BUCKET}/${HAZARDS_FOLDER_PATH}...`);

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === HAZARDS_BUCKET);

    if (!bucketExists) {
      console.log(`❌ Bucket ${HAZARDS_BUCKET} does not exist`);
      return false;
    }

    // Test listing files in hazards folder
    const { data: files, error: filesError } = await supabase.storage
      .from(HAZARDS_BUCKET)
      .list(HAZARDS_FOLDER_PATH, { limit: 10 });

    if (filesError) {
      console.error('Error listing files in hazards folder:', filesError);
      return false;
    }

    console.log('✅ Hazards folder accessible');
    console.log(`Found ${files?.length || 0} files in ${HAZARDS_FOLDER_PATH}`);

    return true;
  } catch (error) {
    console.error('Error testing hazards folder:', error);
    return false;
  }
};

export const listHazardImages = async (): Promise<void> => {
  try {
    console.log(`Listing hazard images in ${HAZARDS_FOLDER_PATH}...`);

    const { data, error } = await supabase.storage
      .from(HAZARDS_BUCKET)
      .list(HAZARDS_FOLDER_PATH, {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing hazard images:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`📷 No images found in ${HAZARDS_FOLDER_PATH}`);
      return;
    }

    console.log(`📷 Found ${data.length} images in ${HAZARDS_FOLDER_PATH}:`);
    data.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name} (${file.metadata?.size || 0} bytes)`);
    });

  } catch (error) {
    console.error('Error in listHazardImages:', error);
  }
};

export const getImagePublicUrl = (imageName: string): string => {
  return getImageUrl(imageName);
};

export const testImageAccess = async (imageName: string): Promise<boolean> => {
  try {
    console.log(`Testing access to image: ${imageName}`);
    
    const publicUrl = getImagePublicUrl(imageName);
    console.log(`Public URL: ${publicUrl}`);
    
    // Test if image is accessible
    const response = await fetch(publicUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log('✅ Image is accessible');
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);
      return true;
    } else {
      console.log(`❌ Image not accessible: ${response.status} ${response.statusText}`);
      return false;
    }
    
  } catch (error) {
    console.error('Error testing image access:', error);
    return false;
  }
};

export const runFullDiagnostics = async (): Promise<void> => {
  console.log('🔍 Running Hazards Component Diagnostics...');
  console.log('=' * 50);
  
  // Test 1: Supabase Connection
  const connectionOk = await testSupabaseConnection();
  
  // Test 2: Hazards Bucket
  const bucketOk = await testHazardsBucket();
  
  // Test 3: List Images
  if (bucketOk) {
    await listHazardImages();
  }
  
  // Test 4: Test Image Access (if images exist)
  if (bucketOk) {
    const { data: files } = await supabase.storage
      .from(HAZARDS_BUCKET)
      .list('', { limit: 1 });
    
    if (files && files.length > 0) {
      await testImageAccess(files[0].name);
    }
  }
  
  console.log('=' * 50);
  console.log('🏁 Diagnostics Complete');
  
  if (connectionOk && bucketOk) {
    console.log('✅ All systems operational - Hazards component ready to use!');
  } else {
    console.log('❌ Some issues detected - check the logs above');
  }
};

// Helper function to format file sizes
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper function to validate image metadata
export const validateImageMetadata = (metadata: any): boolean => {
  const required = ['incidentType', 'severity', 'status'];
  const optional = ['latitude', 'longitude', 'description', 'address', 'city', 'reportedBy'];
  
  // Check required fields
  for (const field of required) {
    if (!metadata[field]) {
      console.warn(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate severity values
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(metadata.severity)) {
    console.warn(`Invalid severity: ${metadata.severity}`);
    return false;
  }
  
  // Validate status values
  const validStatuses = ['reported', 'investigating', 'resolved'];
  if (!validStatuses.includes(metadata.status)) {
    console.warn(`Invalid status: ${metadata.status}`);
    return false;
  }
  
  // Validate coordinates if present
  if (metadata.latitude !== undefined) {
    if (typeof metadata.latitude !== 'number' || metadata.latitude < -90 || metadata.latitude > 90) {
      console.warn(`Invalid latitude: ${metadata.latitude}`);
      return false;
    }
  }
  
  if (metadata.longitude !== undefined) {
    if (typeof metadata.longitude !== 'number' || metadata.longitude < -180 || metadata.longitude > 180) {
      console.warn(`Invalid longitude: ${metadata.longitude}`);
      return false;
    }
  }
  
  console.log('✅ Image metadata validation passed');
  return true;
};

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).hazardTestUtils = {
    testSupabaseConnection,
    testHazardsBucket,
    listHazardImages,
    testImageAccess,
    runFullDiagnostics,
    formatBytes,
    validateImageMetadata
  };
  
  console.log('🔧 Hazard test utilities loaded. Use window.hazardTestUtils to access functions.');
}
