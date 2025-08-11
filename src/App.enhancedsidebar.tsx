import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography, Paper } from '@mui/material';
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import enhancedTheme from './theme/enhancedTheme';
import { EnhancedSidebar } from './components/layout/enhanced/EnhancedSidebar';

const createEmotionCache = () => {
  return createCache({
    key: "mui",
    prepend: true,
  });
};

const emotionCache = createEmotionCache();

// Mock page components for demonstration
const DashboardPage = () => (
  <Box className="p-8">
    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
      Dashboard Overview
    </Typography>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Paper key={item} className="p-6 rounded-xl shadow-sm">
          <Typography variant="h6" className="mb-2">
            Metric Card {item}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sample dashboard content showcasing the enhanced sidebar design
          </Typography>
        </Paper>
      ))}
    </div>
  </Box>
);

const MapPage = () => (
  <Box className="p-8">
    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
      Interactive Map View
    </Typography>
    <Paper className="p-8 rounded-xl shadow-sm h-96 flex items-center justify-center">
      <Typography variant="h6" color="text.secondary">
        Map Component Would Be Here
      </Typography>
    </Paper>
  </Box>
);

const CamerasPage = () => (
  <Box className="p-8">
    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
      Camera Monitoring
    </Typography>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <Paper key={item} className="p-4 rounded-xl shadow-sm">
          <div className="bg-gray-200 rounded-lg h-48 mb-4 flex items-center justify-center">
            <Typography variant="body2" color="text.secondary">
              Camera Feed {item}
            </Typography>
          </div>
          <Typography variant="subtitle1" className="font-semibold">
            Camera Location {item}
          </Typography>
        </Paper>
      ))}
    </div>
  </Box>
);

const AlertsPage = () => (
  <Box className="p-8">
    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
      System Alerts
    </Typography>
    <div className="space-y-4">
      {['Critical', 'Warning', 'Info'].map((type, index) => (
        <Paper key={type} className="p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              type === 'Critical' ? 'bg-red-500' : 
              type === 'Warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <Typography variant="subtitle1" className="font-semibold">
              {type} Alert {index + 1}
            </Typography>
          </div>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            Sample alert content demonstrating the enhanced sidebar functionality
          </Typography>
        </Paper>
      ))}
    </div>
  </Box>
);

const GenericPage = ({ title }: { title: string }) => (
  <Box className="p-8">
    <Typography variant="h4" className="mb-6 font-bold text-gray-800">
      {title}
    </Typography>
    <Paper className="p-8 rounded-xl shadow-sm">
      <Typography variant="body1" color="text.secondary">
        This is the {title.toLowerCase()} page showcasing the enhanced sidebar design with modern visual elements, 
        smooth animations, and improved user experience.
      </Typography>
    </Paper>
  </Box>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCity, setSelectedCity] = useState('thane');

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={enhancedTheme}>
        <CssBaseline />
        <Router>
          <Box className="flex h-screen bg-gray-50">
            <EnhancedSidebar
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
            />
            
            <Box 
              component="main" 
              className="flex-1 overflow-auto"
              sx={{ 
                marginLeft: { xs: 0, md: '280px' },
                transition: 'margin-left 0.3s ease',
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/cameras" element={<CamerasPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/city-updates" element={<GenericPage title="City Updates" />} />
                <Route path="/analytics" element={<GenericPage title="Analytics" />} />
                <Route path="/hazards" element={<GenericPage title="Hazards" />} />
                <Route path="/settings" element={<GenericPage title="Settings" />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;