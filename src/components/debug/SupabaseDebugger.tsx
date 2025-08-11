import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, HAZARDS_BUCKET, HAZARDS_FOLDER_PATH, getImageUrl } from '@/lib/supabase';
import { quickStorageTest } from '@/utils/quickStorageTest';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/solid';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function SupabaseDebugger() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
    setImages([]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Test 1: Basic Supabase Connection
      addResult({ test: 'Supabase Connection', status: 'success', message: 'Testing connection...' });
      
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          addResult({ 
            test: 'Supabase Connection', 
            status: 'error', 
            message: `Connection failed: ${bucketsError.message}`,
            details: bucketsError
          });
          return;
        }
        
        addResult({ 
          test: 'Supabase Connection', 
          status: 'success', 
          message: `Connected successfully. Found ${buckets?.length || 0} buckets.`,
          details: buckets?.map(b => b.name)
        });
      } catch (error) {
        addResult({ 
          test: 'Supabase Connection', 
          status: 'error', 
          message: `Connection error: ${error}`,
          details: error
        });
        return;
      }

      // Test 2: Check if images bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const imagesBucket = buckets?.find(b => b.name === HAZARDS_BUCKET);

        if (!imagesBucket) {
          addResult({
            test: 'Images Bucket Check',
            status: 'error',
            message: `Bucket '${HAZARDS_BUCKET}' not found`,
            details: { availableBuckets: buckets?.map(b => b.name) }
          });
          return;
        } else {
          addResult({
            test: 'Images Bucket Check',
            status: 'success',
            message: `Bucket '${HAZARDS_BUCKET}' exists and is accessible`,
            details: imagesBucket
          });
        }
      } catch (error) {
        addResult({ 
          test: 'Hazard Bucket Check', 
          status: 'error', 
          message: `Error checking bucket: ${error}`,
          details: error
        });
        return;
      }

      // Test 3: List files in hazards folder
      try {
        const { data: files, error: listError } = await supabase.storage
          .from(HAZARDS_BUCKET)
          .list(HAZARDS_FOLDER_PATH, {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (listError) {
          addResult({
            test: 'List Files in Hazards Folder',
            status: 'error',
            message: `Failed to list files in ${HAZARDS_FOLDER_PATH}: ${listError.message}`,
            details: listError
          });
          return;
        }

        const validFiles = files?.filter(file =>
          file.name &&
          !file.name.includes('.emptyFolderPlaceholder') &&
          (file.metadata?.mimetype?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
        ) || [];

        addResult({
          test: 'List Files in Hazards Folder',
          status: validFiles.length > 0 ? 'success' : 'warning',
          message: `Found ${files?.length || 0} total files, ${validFiles.length} valid images in ${HAZARDS_FOLDER_PATH}`,
          details: {
            folderPath: HAZARDS_FOLDER_PATH,
            totalFiles: files?.length || 0,
            validImages: validFiles.length,
            files: files?.map(f => ({ name: f.name, size: f.metadata?.size, type: f.metadata?.mimetype }))
          }
        });

        setImages(validFiles);

      } catch (error) {
        addResult({ 
          test: 'List Files', 
          status: 'error', 
          message: `Error listing files: ${error}`,
          details: error
        });
        return;
      }

      // Test 4: Test public URL generation
      if (images.length > 0) {
        try {
          const testFile = images[0];
          const publicUrl = getImageUrl(testFile.name);
          
          addResult({ 
            test: 'Public URL Generation', 
            status: 'success', 
            message: `Generated URL for ${testFile.name}`,
            details: { url: publicUrl }
          });

          // Test 5: Test image accessibility
          try {
            const response = await fetch(publicUrl, { method: 'HEAD' });
            
            if (response.ok) {
              addResult({ 
                test: 'Image Accessibility', 
                status: 'success', 
                message: `Image ${testFile.name} is accessible`,
                details: { 
                  status: response.status,
                  contentType: response.headers.get('content-type'),
                  contentLength: response.headers.get('content-length')
                }
              });
            } else {
              addResult({ 
                test: 'Image Accessibility', 
                status: 'error', 
                message: `Image not accessible: ${response.status} ${response.statusText}`,
                details: { status: response.status, statusText: response.statusText }
              });
            }
          } catch (fetchError) {
            addResult({ 
              test: 'Image Accessibility', 
              status: 'error', 
              message: `Failed to fetch image: ${fetchError}`,
              details: fetchError
            });
          }

        } catch (urlError) {
          addResult({ 
            test: 'Public URL Generation', 
            status: 'error', 
            message: `Failed to generate URL: ${urlError}`,
            details: urlError
          });
        }
      }

      // Test 6: Test bucket permissions
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(HAZARDS_BUCKET);
        
        if (bucketError) {
          addResult({ 
            test: 'Bucket Permissions', 
            status: 'error', 
            message: `Cannot access bucket info: ${bucketError.message}`,
            details: bucketError
          });
        } else {
          addResult({ 
            test: 'Bucket Permissions', 
            status: 'success', 
            message: `Bucket is ${bucketData.public ? 'public' : 'private'}`,
            details: bucketData
          });
        }
      } catch (error) {
        addResult({ 
          test: 'Bucket Permissions', 
          status: 'warning', 
          message: `Could not check bucket permissions: ${error}`,
          details: error
        });
      }

    } catch (error) {
      addResult({ 
        test: 'General Error', 
        status: 'error', 
        message: `Unexpected error: ${error}`,
        details: error
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Supabase Storage Debugger</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => quickStorageTest()}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Quick Test
            </Button>
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear Results
            </Button>
            <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
              {isRunning ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <EyeIcon className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run Diagnostics'}
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          This tool will test your Supabase storage configuration and help identify issues with image retrieval.
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{result.test}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{result.message}</div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">Show Details</summary>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Found Images ({images.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.slice(0, 6).map((image, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <PhotoIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium truncate">{image.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Size: {image.metadata?.size ? `${Math.round(image.metadata.size / 1024)} KB` : 'Unknown'}</div>
                    <div>Type: {image.metadata?.mimetype || 'Unknown'}</div>
                    <div>Created: {image.created_at ? new Date(image.created_at).toLocaleDateString() : 'Unknown'}</div>
                  </div>
                  <div className="mt-2">
                    <img 
                      src={getImageUrl(image.name)} 
                      alt={image.name}
                      className="w-full h-24 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'w-full h-24 bg-red-100 flex items-center justify-center text-red-500 text-xs rounded';
                        errorDiv.textContent = 'Failed to load';
                        (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
