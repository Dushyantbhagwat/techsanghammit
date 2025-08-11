declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element | null, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    setMapTypeId(mapTypeId: string): void;
    getDiv(): Element | null;
    getTilt(): number;
    setTilt(tilt: number): void;
    getHeading(): number;
    setHeading(heading: number): void;
  }

  namespace event {
    function addListenerOnce(instance: object, eventName: string, handler: Function): MapsEventListener;
    function clearInstanceListeners(instance: object): void;
    function addListener(instance: object, eventName: string, handler: Function): MapsEventListener;
    function trigger(instance: object, eventName: string): void;
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
    tilt?: number;
    heading?: number;
    mapId?: string;
    mapTypeControl?: boolean;
    mapTypeControlOptions?: MapTypeControlOptions;
  }

  interface MapTypeControlOptions {
    mapTypeIds?: string[];
    position?: ControlPosition;
    style?: MapTypeControlStyle;
  }

  enum MapTypeControlStyle {
    DEFAULT = 0,
    HORIZONTAL_BAR = 1,
    DROPDOWN_MENU = 2,
    INSET = 3,
    INSET_LARGE = 4
  }

  enum ControlPosition {
    TOP_LEFT = 1,
    TOP_CENTER = 2,
    TOP_RIGHT = 3,
    LEFT_TOP = 4,
    LEFT_CENTER = 5,
    LEFT_BOTTOM = 6,
    RIGHT_TOP = 7,
    RIGHT_CENTER = 8,
    RIGHT_BOTTOM = 9,
    BOTTOM_LEFT = 10,
    BOTTOM_CENTER = 11,
    BOTTOM_RIGHT = 12
  }

  class WebGLOverlayView {
    constructor();
    setMap(map: Map | null): void;
  }

  interface Map {
    setTilt(tilt: number): void;
    setOptions(options: MapOptions): void;
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
      setOptions(options: Partial<HeatmapLayerOptions>): void;
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

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setIcon(icon: Symbol): void;
    addListener(event: string, handler: Function): MapsEventListener;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    open(map?: Map, anchor?: Marker): void;
    close(): void;
    setContent(content: string | Element): void;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: Symbol;
  }

  interface InfoWindowOptions {
    content?: string | Element;
    position?: LatLng | LatLngLiteral;
  }

  interface Symbol {
    path: SymbolPath;
    fillColor?: string;
    fillOpacity?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  enum SymbolPath {
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4
  }
}