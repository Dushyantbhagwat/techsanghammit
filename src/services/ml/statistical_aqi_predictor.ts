export interface AQIPrediction {
  predictedAQI: number;
  confidence: number;
  timestamp: string;
  trend: 'improving' | 'stable' | 'worsening';
}

class StatisticalAQIPredictor {
  private readonly windowSize = 6; // Hours to look back
  private readonly threshold = 0.1; // 10% change threshold

  private calculateStats(data: number[]) {
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev };
  }

  private validateData(data: number[]): void {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Input data must be a non-empty array');
    }
    if (data.some(x => typeof x !== 'number' || isNaN(x) || x < 0 || x > 500)) {
      throw new Error('Invalid AQI values in data');
    }
  }

  private predictNextValue(data: number[]): number {
    const recentData = data.slice(-this.windowSize);
    const { mean } = this.calculateStats(recentData);
    
    // Calculate weighted moving average with more weight on recent values
    const weighted = recentData.map((value, i) => ({
      value,
      weight: (i + 1) / recentData.length
    }));
    
    const weightedSum = weighted.reduce((sum, { value, weight }) => sum + value * weight, 0);
    const weightTotal = weighted.reduce((sum, { weight }) => sum + weight, 0);
    const prediction = weightedSum / weightTotal;

    // Adjust prediction based on trend
    const trend = prediction > mean ? 1.05 : prediction < mean ? 0.95 : 1;
    return Math.round(prediction * trend);
  }

  private calculateConfidence(data: number[], prediction: number): number {
    const { mean, stdDev } = this.calculateStats(data);
    const volatility = stdDev / mean;
    const deviation = Math.abs(prediction - mean) / mean;
    
    // Higher confidence when volatility and deviation are low
    return Math.max(0.3, Math.min(1.0, (1 - volatility) * 0.6 + (1 - deviation) * 0.4));
  }

  private determineTrend(data: number[], prediction: number): AQIPrediction['trend'] {
    const { mean } = this.calculateStats(data);
    const threshold = mean * this.threshold;

    if (prediction > mean + threshold) return 'worsening';
    if (prediction < mean - threshold) return 'improving';
    return 'stable';
  }

  async predict(recentData: number[]): Promise<AQIPrediction> {
    try {
      this.validateData(recentData);
      
      const predictedAQI = this.predictNextValue(recentData);
      const confidence = this.calculateConfidence(recentData, predictedAQI);
      const trend = this.determineTrend(recentData, predictedAQI);

      return {
        predictedAQI,
        confidence,
        trend,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn('AQI prediction error:', error);
      // Fallback to last known value with low confidence
      return {
        predictedAQI: recentData[recentData.length - 1],
        confidence: 0.3,
        trend: 'stable',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const predictor = new StatisticalAQIPredictor();

export const predictAQI = async (recentData: number[]): Promise<AQIPrediction> => {
  return predictor.predict(recentData);
};