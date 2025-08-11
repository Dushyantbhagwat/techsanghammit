declare module '*.jpg' {
  const value: string;
  export default value;
}

import thaneJunction from './thane-junction.jpg';
import borivaliJunction from './istockphoto-1416447056-612x612.jpg';
import kalyanCircle from './maxresdefault.jpg';
import andheriMetro from './Mumbai_metro.avif';
import dadarTT from './aerial-of-dadar-tt-circle-traffic-also-known-as-khodadad-circle-in-A6P4J9.jpg';
import kurlaSignal from './Corrux-AI-traffic-detection-system-1-e1584350445122.jpg';

export const trafficImages = {
  thaneJunction,
  borivaliJunction,
  kalyanCircle,
  andheriMetro,
  dadarTT,
  kurlaSignal
} as const;