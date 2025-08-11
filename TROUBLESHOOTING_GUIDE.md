# Hazards Component Troubleshooting Guide

## 🚨 **Issue: Images Not Retrieving from Supabase**

If images are uploaded to Supabase but not showing in the Hazards page, follow this step-by-step troubleshooting guide.

## 🔧 **Step 1: Use the Built-in Debugger**

1. **Navigate to the Hazards page** in your application
2. **Click "Debug Storage"** button in the yellow troubleshooting card at the top
3. **Click "Quick Test"** to run a fast storage connectivity test
4. **Click "Run Diagnostics"** for a comprehensive analysis

### **What the Debugger Checks:**

✅ **Supabase Connection** - Verifies basic connectivity  
✅ **Bucket Existence** - Confirms the `hazard-images` bucket exists  
✅ **File Listing** - Lists all files in the bucket  
✅ **Public URL Generation** - Tests URL creation for images  
✅ **Image Accessibility** - Verifies images can be accessed via HTTP  
✅ **Bucket Permissions** - Checks if bucket is public  

## 🔍 **Step 2: Check Browser Console**

Open your browser's Developer Tools (F12) and look for:

### **Expected Console Output:**
```
🔄 Loading hazard data...
🎯 Initializing sample data...
📊 Fetching hazard data...
Fetching hazard images from bucket: hazard-images
Raw data from storage: [array of files]
Total files found: X
Including file: your-image.jpg, mimetype: image/jpeg, size: XXXXX
Valid image files after filtering: X
Processing file: your-image.jpg, URL: https://...
✅ Hazard data loaded: { totalImages: X, ... }
```

### **Common Error Messages:**
- **"Bucket not found"** → Bucket name mismatch
- **"Permission denied"** → Bucket not public or RLS issues
- **"Failed to fetch images"** → Network or authentication issues
- **"No data returned"** → Empty bucket or filtering issues

## 🛠️ **Step 3: Common Solutions**

### **Problem 1: Wrong Bucket Name**
**Symptoms:** "Bucket not found" error  
**Solution:** 
1. Check your Supabase dashboard for the exact bucket name
2. Update `HAZARDS_BUCKET` in `src/lib/supabase.ts` if needed
3. Common variations: `hazard-images`, `hazard_images`, `hazards`, `images`

### **Problem 2: Bucket Not Public**
**Symptoms:** Images upload but can't be accessed  
**Solution:**
1. Go to Supabase Dashboard → Storage → Your Bucket
2. Click "Settings" → Make sure "Public bucket" is enabled
3. Or run the debugger which will attempt to create a public bucket

### **Problem 3: RLS (Row Level Security) Issues**
**Symptoms:** Permission denied errors  
**Solution:**
1. Go to Supabase Dashboard → Storage → Policies
2. Create a policy to allow public read access:
   ```sql
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'hazard-images');
   ```

### **Problem 4: File Format Issues**
**Symptoms:** Files upload but don't appear in the list  
**Solution:**
1. Check if files have proper image MIME types
2. Supported formats: JPEG, PNG, WebP, GIF
3. The debugger will show all files and their MIME types

### **Problem 5: Network/CORS Issues**
**Symptoms:** Fetch errors or blocked requests  
**Solution:**
1. Check if your domain is added to Supabase allowed origins
2. Verify Supabase URL and anon key are correct
3. Check browser network tab for failed requests

## 🔧 **Step 4: Manual Testing**

### **Test Supabase Connection:**
```javascript
// Open browser console and run:
window.quickStorageTest()
```

### **Test Image URLs:**
1. Copy an image URL from the debugger
2. Paste it in a new browser tab
3. The image should load directly

### **Check Bucket Contents:**
1. Go to Supabase Dashboard → Storage
2. Navigate to your bucket
3. Verify files are actually uploaded and visible

## 📋 **Step 5: Verification Checklist**

Before reporting issues, verify:

- [ ] **Supabase credentials** are correct in `src/lib/supabase.ts`
- [ ] **Bucket exists** and is named `hazard-images` (or update the constant)
- [ ] **Bucket is public** (check in Supabase dashboard)
- [ ] **Files are actually uploaded** (visible in Supabase dashboard)
- [ ] **Files have image MIME types** (image/jpeg, image/png, etc.)
- [ ] **No RLS policies** blocking read access
- [ ] **Network connectivity** to Supabase is working
- [ ] **Browser console** shows no CORS or network errors

## 🚀 **Step 6: Reset and Test**

If issues persist:

1. **Clear browser cache** and reload
2. **Delete and recreate** the bucket with public access
3. **Re-upload a test image** (JPEG format recommended)
4. **Run the debugger** again to verify all tests pass
5. **Check the Hazards page** - images should now appear

## 📞 **Getting Help**

If you're still experiencing issues:

1. **Run the full diagnostics** and copy the results
2. **Check browser console** for any error messages
3. **Verify Supabase dashboard** shows your files
4. **Test image URLs** directly in browser
5. **Share the diagnostic results** for further assistance

## 🎯 **Expected Results**

When everything is working correctly:

- ✅ **Debugger shows all green checkmarks**
- ✅ **Console shows successful data loading**
- ✅ **Images display in both grid and list views**
- ✅ **Filtering and sorting work properly**
- ✅ **Image metadata displays correctly**

## 🔄 **Quick Fix Commands**

### **Reset Everything:**
```javascript
// In browser console:
window.quickStorageTest()  // Test storage
window.hazardTestUtils.runFullDiagnostics()  // Full test
```

### **Check Specific Image:**
```javascript
// Replace 'your-image.jpg' with actual filename:
window.hazardTestUtils.testImageAccess('your-image.jpg')
```

### **List All Images:**
```javascript
window.hazardTestUtils.listHazardImages()
```

---

**Remember:** The debugger is your best friend for identifying storage issues. Use it first before diving into manual troubleshooting! 🔧✨
