import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const FilterContainer = styled(Box)(({ theme }) => ({
  padding: '12px',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  marginBottom: '8px',
  padding: '0 12px',
}));

const AlertList = styled(List)(({ theme }) => ({
  padding: 0,
}));

const AlertItem = styled(ListItemButton)({
  borderRadius: '6px',
  padding: '6px 12px',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

const StatusIndicator = styled(FiberManualRecordIcon)<{ alertcolor: string }>(({ alertcolor }) => ({
  fontSize: '12px',
  color: alertcolor,
  filter: `drop-shadow(0 0 4px ${alertcolor}40)`,
  animation: 'pulse 2s infinite',
  
  '@keyframes pulse': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.7,
    },
    '100%': {
      opacity: 1,
    },
  },
}));

const AlertText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.8rem',
  fontWeight: 400,
});

const CountChip = styled(Chip)(({ theme }) => ({
  height: '20px',
  fontSize: '10px',
  fontWeight: 'bold',
  background: 'rgba(255, 255, 255, 0.15)',
  color: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

interface AlertTypeFilterProps {
  isCollapsed?: boolean;
}

// Dynamic alert type configuration
const getAlertTypeConfig = () => [
  {
    type: 'Critical',
    color: '#ff4757',
    severity: 'red',
    description: 'Immediate attention required'
  },
  {
    type: 'Warning',
    color: '#ffa726',
    severity: 'yellow',
    description: 'High priority issues'
  },
  {
    type: 'Info',
    color: '#66bb6a',
    severity: 'green',
    description: 'General information'
  },
];

// Simulate getting alert counts from a global state or API
const getAlertCounts = () => {
  // In a real app, this would come from your alert management system
  const now = new Date();
  const hour = now.getHours();

  // Simulate varying alert counts based on time of day
  const baseRed = hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 3 : 1;
  const baseYellow = hour >= 8 && hour <= 18 ? 8 : 4;
  const baseGreen = 2;

  return {
    red: baseRed + Math.floor(Math.random() * 3),
    yellow: baseYellow + Math.floor(Math.random() * 5),
    green: baseGreen + Math.floor(Math.random() * 2)
  };
};

export function AlertTypeFilter({ isCollapsed = false }: AlertTypeFilterProps) {
  const navigate = useNavigate();
  const [alertCounts, setAlertCounts] = useState(getAlertCounts());
  const alertTypes = getAlertTypeConfig();

  // Update alert counts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertCounts(getAlertCounts());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAlertClick = (severity: string) => {
    navigate(`/alerts?type=${severity}`);
  };

  // Combine alert types with dynamic counts
  const alertTypesWithCounts = alertTypes.map(alert => ({
    ...alert,
    count: alertCounts[alert.severity as keyof typeof alertCounts] || 0
  }));

  if (isCollapsed) {
    return (
      <FilterContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          {alertTypesWithCounts.slice(0, 3).map((alert) => (
            <Box key={alert.type} sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => handleAlertClick(alert.severity)}>
              <StatusIndicator
                alertcolor={alert.color}
              />
              {alert.count > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: alert.color,
                    color: 'white',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  {alert.count > 9 ? '9+' : alert.count}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </FilterContainer>
    );
  }

  return (
    <FilterContainer>
      <SectionTitle>Alert Types</SectionTitle>
      <AlertList>
        {alertTypesWithCounts.map((alert) => (
          <ListItem key={alert.type} disablePadding>
            <AlertItem onClick={() => handleAlertClick(alert.severity)}>
              <ListItemIcon sx={{ minWidth: '24px' }}>
                <StatusIndicator alertcolor={alert.color} />
              </ListItemIcon>
              <ListItemText
                primary={<AlertText>{alert.type}</AlertText>}
              />
              <CountChip label={alert.count} size="small" />
            </AlertItem>
          </ListItem>
        ))}
      </AlertList>
    </FilterContainer>
  );
}
