import React from 'react';

interface CarIconProps {
  color: 'red' | 'blue' | 'gray' | 'white' | 'black';
  className?: string;
  rotation?: number;
}

export const CarIcon: React.FC<CarIconProps> = ({ color, className = '', rotation = 0 }) => {
  const getCarColor = (color: string) => {
    switch (color) {
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'gray': return '#6B7280';
      case 'white': return '#F9FAFB';
      case 'black': return '#1F2937';
      default: return '#6B7280';
    }
  };

  const fillColor = getCarColor(color);
  const strokeColor = color === 'white' ? '#D1D5DB' : '#374151';

  return (
    <svg
      className={className}
      viewBox="0 0 100 60"
      style={{ transform: `rotate(${rotation}deg)` }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Car body */}
      <rect
        x="10"
        y="15"
        width="80"
        height="30"
        rx="8"
        ry="8"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      
      {/* Car roof */}
      <rect
        x="20"
        y="8"
        width="60"
        height="20"
        rx="6"
        ry="6"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
        opacity="0.9"
      />
      
      {/* Windshield */}
      <rect
        x="25"
        y="10"
        width="50"
        height="15"
        rx="4"
        ry="4"
        fill="#E5E7EB"
        stroke={strokeColor}
        strokeWidth="1"
        opacity="0.8"
      />
      
      {/* Front wheel */}
      <circle
        cx="25"
        cy="50"
        r="8"
        fill="#1F2937"
        stroke="#374151"
        strokeWidth="1"
      />
      <circle
        cx="25"
        cy="50"
        r="5"
        fill="#4B5563"
      />
      
      {/* Rear wheel */}
      <circle
        cx="75"
        cy="50"
        r="8"
        fill="#1F2937"
        stroke="#374151"
        strokeWidth="1"
      />
      <circle
        cx="75"
        cy="50"
        r="5"
        fill="#4B5563"
      />
      
      {/* Headlights */}
      <ellipse
        cx="12"
        cy="25"
        rx="3"
        ry="5"
        fill="#FEF3C7"
        stroke="#F59E0B"
        strokeWidth="0.5"
      />
      <ellipse
        cx="12"
        cy="35"
        rx="3"
        ry="5"
        fill="#FEF3C7"
        stroke="#F59E0B"
        strokeWidth="0.5"
      />
      
      {/* Taillights */}
      <ellipse
        cx="88"
        cy="25"
        rx="3"
        ry="5"
        fill="#FEE2E2"
        stroke="#EF4444"
        strokeWidth="0.5"
      />
      <ellipse
        cx="88"
        cy="35"
        rx="3"
        ry="5"
        fill="#FEE2E2"
        stroke="#EF4444"
        strokeWidth="0.5"
      />
    </svg>
  );
};

// Simplified car icon for smaller spaces
export const SimpleCarIcon: React.FC<CarIconProps> = ({ color, className = '', rotation = 0 }) => {
  const getCarColor = (color: string) => {
    switch (color) {
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'gray': return '#6B7280';
      case 'white': return '#F9FAFB';
      case 'black': return '#1F2937';
      default: return '#6B7280';
    }
  };

  const fillColor = getCarColor(color);
  const strokeColor = color === 'white' ? '#D1D5DB' : '#374151';

  return (
    <svg
      className={className}
      viewBox="0 0 80 40"
      style={{ transform: `rotate(${rotation}deg)` }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified car body */}
      <rect
        x="5"
        y="10"
        width="70"
        height="20"
        rx="6"
        ry="6"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.5"
      />
      
      {/* Front wheels */}
      <circle cx="18" cy="35" r="4" fill="#1F2937" />
      <circle cx="18" cy="35" r="2.5" fill="#4B5563" />
      
      {/* Rear wheels */}
      <circle cx="62" cy="35" r="4" fill="#1F2937" />
      <circle cx="62" cy="35" r="2.5" fill="#4B5563" />
      
      {/* Simple windshield */}
      <rect
        x="15"
        y="12"
        width="50"
        height="16"
        rx="3"
        ry="3"
        fill="#E5E7EB"
        opacity="0.6"
      />
    </svg>
  );
};

// Car colors array for random assignment
export const CAR_COLORS: Array<'red' | 'blue' | 'gray' | 'white' | 'black'> = [
  'red', 'blue', 'gray', 'white', 'black'
];

// Get a random car color
export const getRandomCarColor = (): 'red' | 'blue' | 'gray' | 'white' | 'black' => {
  return CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];
};

// Assign consistent colors to specific spots (for demo purposes)
export const getSpotCarColor = (spotId: string): 'red' | 'blue' | 'gray' | 'white' | 'black' => {
  const colorMap: Record<string, 'red' | 'blue' | 'gray' | 'white' | 'black'> = {
    'A1': 'black',
    'A2': 'red',
    'A3': 'gray',
    'A4': 'blue',
    'A5': 'white',
    'A6': 'red',
    'A7': 'black',
    'A8': 'gray',
    'A9': 'blue',
    'A10': 'white'
  };

  return colorMap[spotId] || getRandomCarColor();
};
