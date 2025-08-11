interface ParkingEvent {
  event: 'car_parked' | 'car_left';
  spot_id: string;
  timestamp: string;
  section: string;
}

interface ParkingEventResponse {
  events: ParkingEvent[];
  timestamp: number;
}

interface ParkingStatusResponse {
  occupied_spots: string[];
  detected_cars: Array<{
    spot_id: string;
    car: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    section: string;
  }>;
  total_spots: number;
  timestamp?: number;
}

class ParkingEventService {
  private eventListeners: Array<(events: ParkingEvent[]) => void> = [];
  private statusListeners: Array<(status: ParkingStatusResponse) => void> = [];
  private isPollingEvents = false;
  private eventPollingInterval: NodeJS.Timeout | null = null;
  private baseUrl = 'http://127.0.0.1:5002';

  // Subscribe to parking events
  onParkingEvents(callback: (events: ParkingEvent[]) => void) {
    this.eventListeners.push(callback);
    
    // Start polling if not already started
    if (!this.isPollingEvents) {
      this.startEventPolling();
    }

    // Return unsubscribe function
    return () => {
      this.eventListeners = this.eventListeners.filter(listener => listener !== callback);
      
      // Stop polling if no listeners
      if (this.eventListeners.length === 0) {
        this.stopEventPolling();
      }
    };
  }

  // Subscribe to parking status updates
  onParkingStatus(callback: (status: ParkingStatusResponse) => void) {
    this.statusListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.statusListeners = this.statusListeners.filter(listener => listener !== callback);
    };
  }

  // Get initial parking status
  async getInitialParkingStatus(): Promise<ParkingStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/parking_status_initial`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching initial parking status:', error);
      throw error;
    }
  }

  // Get current parking status (for live feed)
  async getCurrentParkingStatus(): Promise<ParkingStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/parking_status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching current parking status:', error);
      throw error;
    }
  }

  // Start polling for parking events
  private startEventPolling() {
    if (this.isPollingEvents) return;

    this.isPollingEvents = true;
    this.eventPollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/parking_events`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ParkingEventResponse = await response.json();
        
        if (data.events && data.events.length > 0) {
          // Notify all event listeners
          this.eventListeners.forEach(callback => {
            try {
              callback(data.events);
            } catch (error) {
              console.error('Error in parking event callback:', error);
            }
          });

          // Also get updated status and notify status listeners
          try {
            const status = await this.getCurrentParkingStatus();
            this.statusListeners.forEach(callback => {
              try {
                callback(status);
              } catch (error) {
                console.error('Error in parking status callback:', error);
              }
            });
          } catch (error) {
            console.error('Error fetching updated status after events:', error);
          }
        }
      } catch (error) {
        console.error('Error polling parking events:', error);
      }
    }, 1000); // Poll every 1 second for events
  }

  // Stop polling for parking events
  private stopEventPolling() {
    if (this.eventPollingInterval) {
      clearInterval(this.eventPollingInterval);
      this.eventPollingInterval = null;
    }
    this.isPollingEvents = false;
  }

  // Manual refresh - force get current status
  async refreshParkingStatus(): Promise<ParkingStatusResponse> {
    try {
      const status = await this.getCurrentParkingStatus();
      
      // Notify all status listeners
      this.statusListeners.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in parking status callback:', error);
        }
      });

      return status;
    } catch (error) {
      console.error('Error refreshing parking status:', error);
      throw error;
    }
  }

  // Cleanup - stop all polling
  cleanup() {
    this.stopEventPolling();
    this.eventListeners = [];
    this.statusListeners = [];
  }
}

// Export singleton instance
export const parkingEventService = new ParkingEventService();

// Export types
export type { ParkingEvent, ParkingEventResponse, ParkingStatusResponse };
