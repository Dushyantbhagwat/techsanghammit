import { supabase, HAZARDS_BUCKET, HAZARDS_FOLDER_PATH } from '@/lib/supabase';

// Quick test function to check storage
export const quickStorageTest = async () => {
  console.log('🔍 Quick Storage Test Starting...');
  
  try {
    // Test 1: List all buckets
    console.log('1. Listing all buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    console.log('✅ Available buckets:', buckets?.map(b => b.name) || []);
    
    // Test 2: Test the specific hazards folder path
    console.log(`2. Testing hazards folder: ${HAZARDS_BUCKET}/${HAZARDS_FOLDER_PATH}`);

    try {
      const { data: files, error: listError } = await supabase.storage
        .from(HAZARDS_BUCKET)
        .list(HAZARDS_FOLDER_PATH, { limit: 10 });

      if (listError) {
        console.log(`   ❌ ${HAZARDS_FOLDER_PATH}: ${listError.message}`);
      } else {
        console.log(`   ✅ ${HAZARDS_FOLDER_PATH}: Found ${files?.length || 0} files`);
        if (files && files.length > 0) {
          console.log(`   📁 Files in ${HAZARDS_FOLDER_PATH}:`, files.map(f => f.name));
        }
      }
    } catch (error) {
      console.log(`   ❌ ${HAZARDS_FOLDER_PATH}: ${error}`);
    }

    // Test 2b: Also test root bucket for comparison
    console.log(`2b. Testing root bucket: ${HAZARDS_BUCKET}`);

    try {
      const { data: files, error: listError } = await supabase.storage
        .from(HAZARDS_BUCKET)
        .list('', { limit: 5 });

      if (listError) {
        console.log(`   ❌ Root bucket: ${listError.message}`);
      } else {
        console.log(`   ✅ Root bucket: Found ${files?.length || 0} files/folders`);
        if (files && files.length > 0) {
          console.log(`   📁 Items in root:`, files.map(f => f.name));
        }
      }
    } catch (error) {
      console.log(`   ❌ Root bucket: ${error}`);
    }
    
    // Test 3: Check if the 'images' bucket exists (our actual bucket)
    const imagesBucketExists = buckets?.some(b => b.name === 'images');

    if (imagesBucketExists) {
      console.log('3. ✅ Images bucket exists and is being used for hazards');
    } else {
      console.log('3. ❌ Images bucket not found - this might be the issue');
    }
    
    // Test 4: Test public URL generation
    console.log('4. Testing public URL generation...');
    const testUrl = supabase.storage.from(HAZARDS_BUCKET).getPublicUrl(`${HAZARDS_FOLDER_PATH}/test.jpg`);
    console.log('✅ Public URL format:', testUrl.data.publicUrl);
    
  } catch (error) {
    console.error('❌ Quick storage test failed:', error);
  }
  
  console.log('🏁 Quick Storage Test Complete');
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  (window as any).quickStorageTest = quickStorageTest;
  console.log('🔧 Quick storage test loaded. Run window.quickStorageTest() to test.');
}
