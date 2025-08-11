import { PARKING_SPOTS } from './constants';

export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

export interface ParkingSpot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
