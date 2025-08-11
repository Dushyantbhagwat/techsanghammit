import * as tf from '@tensorflow/tfjs';

export interface AQIPrediction {
  predictedAQI: number;
  confidence: number;
  timestamp: string;
  trend: 'improving' | 'stable' | 'worsening';
}

interface ModelMetadata {
  timestamp: string;
  metrics: {
    loss: number;
    validationLoss: number;
  };
  dataStats: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
  };
}

class AQIPredictor {
  private model: tf.LayersModel | null = null;
  private metadata: ModelMetadata | null = null;
  private readonly lookback = 6; // Reduced lookback period for faster processing
  private readonly predictionHorizon = 1;
  private readonly modelStorageKey = 'aqi-predictor-model';
  private readonly metadataStorageKey = 'aqi-predictor-metadata';
  private readonly batchSize = 32;
  private readonly maxSamples = 1000; // Limit dataset size

  constructor() {
    // Constructor is empty as initialization is handled by loadModel/initModel
  }

  async initModel() {
    try {
      // Try to load existing model first
      const loadedModel = await this.loadModel();
      if (loadedModel) {
        console.log('Loaded existing AQI predictor model');
        return;
      }

      // Create a minimal model for real-time predictions
      const model = tf.sequential();

      // Simple dense layers for faster computation
      model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
        inputShape: [this.lookback]
      }));

      model.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));

      model.add(tf.layers.dense({
        units: 1
      }));

      // Use SGD optimizer for lighter computation
      model.compile({
        optimizer: tf.train.sgd(0.01),
        loss: 'meanSquaredError'
      });

      this.model = model;
      console.log('Initialized new AQI predictor model');
    } catch (error) {
      console.warn('Error initializing AQI predictor model:', error);
      // Create a fallback simple model
      const model = tf.sequential();
      model.add(tf.layers.dense({
        units: 1,
        inputShape: [this.lookback]
      }));
      model.compile({
        optimizer: 'sgd',
        loss: 'meanSquaredError'
      });
      this.model = model;
      console.log('Using fallback simple model');
    }
  }

  private calculateDataStats(data: number[]): ModelMetadata['dataStats'] {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    return {
      mean,
      stdDev,
      min: Math.min(...data),
      max: Math.max(...data)
    };
  }

  private validateData(data: number[]): void {
    if (!Array.isArray(data)) {
      throw new Error('Input data must be an array');
    }
    if (data.length === 0) {
      throw new Error('Input data array is empty');
    }
    if (data.some(x => typeof x !== 'number' || isNaN(x))) {
      throw new Error('Input data contains non-numeric or NaN values');
    }
    if (data.some(x => x < 0 || x > 500)) {
      throw new Error('Input data contains AQI values outside valid range (0-500)');
    }
  }

  // Normalize data using z-score normalization
  private normalize(data: number[]): number[] {
    const stats = this.metadata?.dataStats || this.calculateDataStats(data);
    return data.map(x => (x - stats.mean) / stats.stdDev);
  }

  // Denormalize predictions
  private denormalize(normalized: number): number {
    if (!this.metadata?.dataStats) {
      throw new Error('Model metadata not available for denormalization');
    }
    const { mean, stdDev } = this.metadata.dataStats;
    return normalized * stdDev + mean;
  }

  // Prepare data with batching and memory optimization
  private prepareData(data: number[]): [tf.Tensor2D, tf.Tensor2D] {
    try {
      // Limit the amount of data to process
      const limitedData = data.slice(-this.maxSamples);
      
      const X: number[][] = [];
      const y: number[] = [];

      // Create sliding windows with reduced lookback period
      for (let i = 0; i < limitedData.length - this.lookback - this.predictionHorizon; i++) {
        const window = limitedData.slice(i, i + this.lookback);
        X.push(window);
        y.push(limitedData[i + this.lookback + this.predictionHorizon - 1]);
      }

      // Use tf.tidy to automatically clean up intermediate tensors
      return tf.tidy(() => {
        // Convert to tensors with proper shapes for dense layers
        const xTensor = tf.tensor2d(X);
        const yTensor = tf.tensor2d(y, [y.length, 1]);
        
        return [xTensor, yTensor];
      });
    } catch (error) {
      throw new Error(`Failed to prepare data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async trainModel(historicalData: number[]): Promise<tf.History | undefined> {
    if (!this.model) {
      await this.initModel();
    }

    try {
      this.validateData(historicalData);

      // Calculate and store data statistics
      this.metadata = {
        timestamp: new Date().toISOString(),
        metrics: { loss: 0, validationLoss: 0 },
        dataStats: this.calculateDataStats(historicalData)
      };

      // Use tf.tidy to automatically clean up tensors
      return await tf.tidy(async () => {
        const normalizedData = this.normalize(historicalData);
        const [X, y] = this.prepareData(normalizedData);

        const history = await this.model!.fit(X, y, {
          epochs: 5,
          batchSize: this.batchSize,
          shuffle: true,
          validationSplit: 0.2,
          callbacks: {
            onBatchEnd: async () => await tf.nextFrame()
          }
        });

        if (history.history.loss) {
          const lastLoss = history.history.loss[history.history.loss.length - 1];
          this.metadata!.metrics = {
            loss: typeof lastLoss === 'number' ? lastLoss : 1,
            validationLoss: 0
          };
        }

        return history;
      });
    } catch (error) {
      console.warn('Error in trainModel:', error);
      return undefined;
    }
  }

    try {
      // Update metadata with training results
      if (history.history.loss) {
        const lastLoss = history.history.loss[history.history.loss.length - 1];
        this.metadata!.metrics = {
          loss: typeof lastLoss === 'number' ? lastLoss : 1,
          validationLoss: history.history.val_loss?.[history.history.val_loss.length - 1] || 0
        };
      }

      // Save model and metadata
      await this.saveModel().catch(err =>
        console.warn('Failed to save model:', err)
      );

      return history;
    } finally {
      // Clean up tensors
      trainTensors.X.dispose();
      trainTensors.y.dispose();
    }
  }

  async predict(recentData: number[]): Promise<AQIPrediction> {
    try {
      if (!this.model) {
        throw new Error('Model not initialized');
      }

      this.validateData(recentData);

      // Ensure we have enough data
      if (recentData.length < this.lookback) {
        throw new Error(`Need at least ${this.lookback} data points for prediction`);
      }

      // Normalize data
      const normalizedData = this.normalize(recentData);

      // Use tf.tidy to automatically manage tensor memory
      const prediction = tf.tidy(() => {
        // Prepare input data with correct shape for dense layers
        const sequence = normalizedData.slice(-this.lookback);
        const input = tf.tensor2d([sequence]);

        // Make prediction
        const normalizedPrediction = this.model!.predict(input) as tf.Tensor;
        return normalizedPrediction;
      });

      try {
        // Get prediction value and denormalize
        const predictionValue = await prediction.data();
        const predictedValue = Math.round(this.denormalize(predictionValue[0]));

        // Calculate confidence and trend
        const recentValues = recentData.slice(-6);
        const { confidence, trend } = this.calculateMetrics(recentValues, predictedValue);

        return {
          predictedAQI: predictedValue,
          confidence,
          trend,
          timestamp: new Date().toISOString()
        };
      } finally {
        // Ensure prediction tensor is disposed
        prediction.dispose();
      }

    } catch (error) {
      console.error('Error making AQI prediction:', error);
      throw new Error('Failed to make AQI prediction');
    }
  }

  private calculateMetrics(recentData: number[], prediction: number): { confidence: number; trend: AQIPrediction['trend'] } {
    // Calculate trend
    const trend = this.calculateTrend(recentData, prediction);
    
    // Calculate confidence based on multiple factors
    const variability = this.calculateVariability(recentData);
    const predictionDeviation = Math.abs(prediction - recentData[recentData.length - 1]) / recentData[recentData.length - 1];
    const modelQuality = this.metadata?.metrics.validationLoss ?? 1;
    
    // Combine factors for final confidence score
    const confidence = Math.max(0.3, Math.min(1.0, (
      (1 - variability) * 0.4 +      // Data stability
      (1 - predictionDeviation) * 0.4 + // Prediction reasonableness
      (1 - modelQuality) * 0.2       // Model performance
    )));

    return { confidence, trend };
  }

  private calculateTrend(recentData: number[], prediction: number): AQIPrediction['trend'] {
    const average = recentData.reduce((a, b) => a + b) / recentData.length;
    const threshold = average * 0.1; // 10% change threshold

    if (prediction > average + threshold) return 'worsening';
    if (prediction < average - threshold) return 'improving';
    return 'stable';
  }

  private calculateVariability(data: number[]): number {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize variability to 0-1 range
    return Math.min(stdDev / mean, 1);
  }

  private async saveModel(): Promise<void> {
    if (!this.model || !this.metadata) {
      throw new Error('No model or metadata to save');
    }

    try {
      await this.model.save(`localstorage://${this.modelStorageKey}`);
      localStorage.setItem(this.metadataStorageKey, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Error saving AQI predictor model:', error);
      throw new Error('Failed to save AQI predictor model');
    }
  }

  public async loadModel(): Promise<boolean> {
    try {
      const models = await tf.io.listModels();
      const modelInfo = models[`localstorage://${this.modelStorageKey}`];
      
      if (!modelInfo) {
        return false;
      }

      this.model = await tf.loadLayersModel(`localstorage://${this.modelStorageKey}`);
      const metadataStr = localStorage.getItem(this.metadataStorageKey);
      
      if (metadataStr) {
        this.metadata = JSON.parse(metadataStr);
      }

      return true;
    } catch (error) {
      console.warn('Error loading AQI predictor model:', error);
      return false;
    }
  }
}

// Singleton instance with lazy initialization
let predictor: AQIPredictor | null = null;

const getPredictor = async (): Promise<AQIPredictor> => {
  if (!predictor) {
    await tf.ready();
    predictor = new AQIPredictor();
  }
  return predictor;
};

export const initializeAQIPredictor = async (historicalData: number[]) => {
  try {
    const predictor = await getPredictor();
    // Only train if no existing model is loaded
    const modelLoaded = await predictor.loadModel();
    if (!modelLoaded) {
      await predictor.initModel();
      await predictor.trainModel(historicalData);
    }
  } catch (error) {
    console.warn('AQI predictor initialization failed:', error);
  }
};

export const predictAQI = async (recentData: number[]): Promise<AQIPrediction> => {
  try {
    const predictor = await getPredictor();
    return await predictor.predict(recentData);
  } catch (error) {
    console.warn('AQI prediction failed:', error);
    return {
      predictedAQI: recentData[recentData.length - 1] || 0,
      confidence: 0.5,
      trend: 'stable',
      timestamp: new Date().toISOString()
    };
  }
};