import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell } from 'lucide-react';
import { useCity } from '@/contexts/CityContext';
import { emailService } from '@/services/email';

export function TrafficAnalytics() {
  const [congestionLevel, setCongestionLevel] = useState(50);
  const [averageSpeed, setAverageSpeed] = useState(35);
  const [vehicleCount, setVehicleCount] = useState(649);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { selectedCity } = useCity();

  const AUTHORITY_EMAIL = 'dushyantdbhagwat@gmail.com';

  useEffect(() => {
    // Check if notifications are already permitted
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      // Show test notification if permission granted
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive traffic alerts.',
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const getStatusColor = (level: number) => {
    if (level >= 75) return 'text-red-500';
    if (level >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusText = (level: number) => {
    if (level >= 75) return 'Peak Hours';
    if (level >= 50) return 'Moderate';
    return 'Normal';
  };

  const simulateHighTraffic = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission !== 'granted') {
        alert('Please enable notifications to receive traffic alerts.');
        return;
      }
    }

    setIsSimulating(true);
    
    // Generate random high congestion between 75-95%
    const newCongestion = Math.floor(Math.random() * 20) + 75;
    
    // Update metrics
    setCongestionLevel(newCongestion);
    setAverageSpeed(Math.max(15, 50 - newCongestion/2)); // Speed decreases with congestion
    setVehicleCount(Math.floor(Math.random() * 300) + 800);

    // Send alert
    const subject = `🚨 High Traffic Alert - ${selectedCity}`;
    const message = `
High Traffic Alert for ${selectedCity}

Current Traffic Metrics:
- Congestion Level: ${newCongestion}%
- Average Speed: ${Math.floor(averageSpeed)} km/h
- Vehicle Count: ${vehicleCount} vehicles

Status: Critical - Peak Hours
Location: ${selectedCity} Central District

This is an automated alert from the Smart City Traffic Monitoring System. Immediate attention may be required to manage traffic flow and prevent further congestion.

Actions Recommended:
1. Deploy additional traffic personnel
2. Adjust signal timings
3. Issue public advisory if needed

Please monitor the situation and take necessary actions.

---
Smart City Traffic Management System
    `;
    
    try {
      await emailService.sendEmail(AUTHORITY_EMAIL, subject, message);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }

    // Reset simulation state after 5 seconds
    setTimeout(() => {
      setIsSimulating(false);
    }, 5000);
  };

  useEffect(() => {
    // Regular updates
    const interval = setInterval(() => {
      if (!isSimulating) {
        setCongestionLevel(prev => {
          const change = Math.random() * 10 - 5;
          return Math.min(Math.max(30, prev + change), 70);
        });

        setAverageSpeed(prev => {
          const change = Math.random() * 6 - 3;
          return Math.min(Math.max(20, prev + change), 50);
        });

        setVehicleCount(prev => {
          const change = Math.floor(Math.random() * 40 - 20);
          return Math.min(Math.max(400, prev + change), 800);
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Traffic Flow</h2>
        <div className="flex items-center gap-2">
          {!notificationsEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Enable Notifications
            </Button>
          )}
          <Button 
            onClick={simulateHighTraffic} 
            disabled={isSimulating}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Simulate High Traffic
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Congestion Level</h3>
          <div className="mt-2 flex items-baseline">
            <span className={`text-2xl font-bold ${getStatusColor(congestionLevel)}`}>
              {Math.round(congestionLevel)}%
            </span>
            <span className="ml-2 text-sm text-muted-foreground">
              {getStatusText(congestionLevel)}
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Average Speed</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold">
              {Math.round(averageSpeed)} km/h
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Vehicle Count</h3>
          <div className="mt-2">
            <span className="text-2xl font-bold">{vehicleCount}</span>
            <span className="ml-2 text-sm text-muted-foreground">vehicles</span>
          </div>
        </Card>
      </div>

      {congestionLevel >= 75 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">High Traffic Alert</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Traffic congestion has reached critical levels. Alert has been sent to authorities.
          </p>
        </div>
      )}
    </div>
  );
}