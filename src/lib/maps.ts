let isInitialized = false;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

interface InitOptions {
  apiKey: string;
  onError?: (error: Error) => void;
}

export const initGoogleMaps = async ({ apiKey, onError }: InitOptions): Promise<void> => {
  // Return existing initialization if already complete
  if (isInitialized && window.google?.maps) {
    return Promise.resolve();
  }

  // Return existing promise if initialization is in progress
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = new Promise<void>((resolve, reject) => {
    try {
      // Clean up any existing scripts
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.parentNode?.removeChild(script));

      // Create a unique callback name
      const callbackName = `initGoogleMaps_${Math.random().toString(36).substr(2, 9)}`;

      // Define the callback
      window[callbackName] = () => {
        isInitialized = true;
        isInitializing = false;
        delete window[callbackName];
        resolve();
      };

      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuYG7_yoGFjnL3kuJL6QBaPZ8QAx24SMM&libraries=visualization,webgl&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        isInitializing = false;
        delete window[callbackName];
        const err = new Error('Failed to load Google Maps API');
        onError?.(err);
        reject(err);
      };

      document.head.appendChild(script);
    } catch (error) {
      isInitializing = false;
      const err = error instanceof Error ? error : new Error('Unknown error initializing Google Maps');
      onError?.(err);
      reject(err);
    }
  });

  return initPromise;
};

export const createMap = (
  element: HTMLElement,
  options: google.maps.MapOptions
): google.maps.Map => {
  if (!isInitialized || !window.google?.maps) {
    throw new Error('Google Maps not initialized. Call initGoogleMaps first.');
  }
  return new google.maps.Map(element, options);
};

export const createHeatmap = (
  options: google.maps.visualization.HeatmapLayerOptions
): google.maps.visualization.HeatmapLayer => {
  if (!isInitialized || !window.google?.maps) {
    throw new Error('Google Maps not initialized. Call initGoogleMaps first.');
  }
  return new google.maps.visualization.HeatmapLayer(options);
};

export const createTrafficLayer = (): google.maps.TrafficLayer => {
  if (!isInitialized || !window.google?.maps) {
    throw new Error('Google Maps not initialized. Call initGoogleMaps first.');
  }
  return new google.maps.TrafficLayer();
};

export const setupPhotorealisticView = (map: google.maps.Map): void => {
  if (!isInitialized || !window.google?.maps) {
    throw new Error('Google Maps not initialized. Call initGoogleMaps first.');
  }

  // Enable WebGL mode
  map.setMapTypeId('satellite');

  // Set tilt and heading for 3D effect
  map.setTilt(45);
  
  // Configure map settings for photorealistic view
  const mapOptions: google.maps.MapOptions = {
    tilt: 45,
    heading: 0,
    zoom: 18,
    disableDefaultUI: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite'],
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT
    }
  };
  
  map.setOptions(mapOptions);

  // Enable 3D buildings
  const webglOverlayView = new google.maps.WebGLOverlayView();
  webglOverlayView.setMap(map);
};