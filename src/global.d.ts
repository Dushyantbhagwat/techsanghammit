declare module '@tensorflow-models/coco-ssd' {
  import * as tf from '@tensorflow/tfjs';

  export interface DetectedObject {
    bbox: [number, number, number, number];
    class: string;
    score: number;
  }

  export class ObjectDetection {
    load(): Promise<void>;
    detect(img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Promise<DetectedObject[]>;
  }

  export function load(config?: {
    base?: 'lite_mobilenet_v2' | 'mobilenet_v1' | 'mobilenet_v2';
  }): Promise<ObjectDetection>;
}