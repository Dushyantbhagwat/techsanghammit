import React from 'react';
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

const alertTypes = [
  { 
    type: 'Critical', 
    color: '#ff4757', 
    severity: 'red', 
    count: 3,
    description: 'Immediate attention required'
  },
  { 
    type: 'Major', 
    color: '#ff6b35', 
    severity: 'yellow', 
    count: 7,
    description: 'High priority issues'
  },
  { 
    type: 'Minor', 
    color: '#ffa726', 
    severity: 'yellow', 
    count: 12,
    description: 'Low priority issues'
  },
  { 
    type: 'Warning', 
    color: '#42a5f5', 
    severity: 'yellow', 
    count: 5,
    description: 'Potential issues'
  },
  { 
    type: 'Info', 
    color: '#66bb6a', 
    severity: 'green', 
    count: 15,
    description: 'General information'
  },
];

export function AlertTypeFilter({ isCollapsed = false }: AlertTypeFilterProps) {
  const navigate = useNavigate();

  const handleAlertClick = (severity: string, type: string) => {
    navigate(`/alerts?type=${severity}&category=${type.toLowerCase()}`);
  };

  if (isCollapsed) {
    return (
      <FilterContainer>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          {alertTypes.slice(0, 3).map((alert) => (
            <StatusIndicator 
              key={alert.type}
              alertcolor={alert.color}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleAlertClick(alert.severity, alert.type)}
            />
          ))}
        </Box>
      </FilterContainer>
    );
  }

  return (
    <FilterContainer>
      <SectionTitle>Alert Types</SectionTitle>
      <AlertList>
        {alertTypes.map((alert) => (
          <ListItem key={alert.type} disablePadding>
            <AlertItem onClick={() => handleAlertClick(alert.severity, alert.type)}>
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
