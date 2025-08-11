declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element | null, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    setMapTypeId(mapTypeId: string): void;
    getDiv(): Element | null;
  }

  namespace event {
    function addListenerOnce(instance: object, eventName: string, handler: Function): MapsEventListener;
    function clearInstanceListeners(instance: object): void;
  }

  interface MapsEventListener {
    remove(): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapOptions {
    zoom?: number;
    center?: LatLng | LatLngLiteral;
    mapTypeId?: string;
    styles?: Array<MapTypeStyle>;
    disableDefaultUI?: boolean;
    draggable?: boolean;
    zoomControl?: boolean;
    scrollwheel?: boolean;
    streetViewControl?: boolean;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers: Array<{ [key: string]: any }>;
  }

  class TrafficLayer {
    constructor();
    setMap(map: Map | null): void;
  }

  namespace visualization {
    class HeatmapLayer {
      constructor(opts?: HeatmapLayerOptions);
      setData(data: MVCArray<LatLng | WeightedLocation> | Array<LatLng | WeightedLocation>): void;
      setMap(map: Map | null): void;
    }

    interface HeatmapLayerOptions {
      data?: MVCArray<LatLng | WeightedLocation> | Array<LatLng | WeightedLocation>;
      dissipating?: boolean;
      gradient?: string[];
      map?: Map;
      maxIntensity?: number;
      opacity?: number;
      radius?: number;
    }

    interface WeightedLocation {
      location: LatLng;
      weight?: number;
    }
  }

  class MVCArray<T> extends Array<T> {
    constructor(array?: T[]);
    clear(): void;
    getArray(): T[];
    getAt(i: number): T;
    insertAt(i: number, elem: T): void;
    removeAt(i: number): T;
    setAt(i: number, elem: T): void;
  }
}