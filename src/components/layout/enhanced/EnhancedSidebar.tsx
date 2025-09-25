import React, { useState } from 'react';
import { 
  Drawer, 
  Box, 
  List, 
  IconButton, 
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';

// Components
import { SidebarHeader } from './SidebarHeader';
import { NavigationItem } from './NavigationItem';
import { LocationSelector } from './LocationSelector';
import { AlertTypeFilter } from './AlertTypeFilter';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

import { Theme } from '@mui/material/styles';

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop: string) => prop !== 'collapsed',
})<{ collapsed?: boolean }>(({ theme, collapsed }: { theme: Theme, collapsed?: boolean }) => ({
  width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
  flexShrink: 0,
  position: 'fixed',
  height: '100vh',
  zIndex: 1200,
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
    boxSizing: 'border-box',
    // Glass morphism background
    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.09) 0%,
        rgba(255, 255, 255, 0.06) 25%,
        rgba(255, 255, 255, 0.04) 50%,
        rgba(255, 255, 255, 0.08) 75%,
        rgba(255, 255, 255, 0.11) 100%
      ),
      linear-gradient(
        180deg,
        rgba(108, 93, 211, 0.15) 0%,
        rgba(74, 62, 153, 0.12) 30%,
        rgba(61, 47, 127, 0.10) 60%,
        rgba(45, 35, 95, 0.08) 100%
      )
    `,
    backdropFilter: 'blur(20px) saturate(1.8)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
    borderRight: `1px solid rgba(255, 255, 255, 0.18)`,
    borderImage: `linear-gradient(
      180deg, 
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.2) 100%
    ) 1`,
    transition: theme.transitions.create(['width', 'background'], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    // Add subtle box shadow for depth
    boxShadow: `
      0 8px 32px rgba(108, 93, 211, 0.15),
      0 4px 16px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05)
    `,
    // Hide scrollbar completely
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    '&::-webkit-scrollbar': {
      display: 'none', // Chrome, Safari, Opera
      width: 0,
    },
    // Add animated gradient overlay on hover
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '100%',
      background: `
        linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          transparent 30%,
          transparent 70%,
          rgba(255, 255, 255, 0.03) 100%
        )
      `,
      opacity: 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
      zIndex: 1,
    },
    '&:hover::before': {
      opacity: 1,
    },
  },
}));

const SidebarContent = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 2, // Above the animated overlay
  // Add subtle inner glow
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '10px',
    right: '10px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
    borderRadius: '1px',
    opacity: 0.6,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '20px',
    left: '10px',
    right: '10px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
    borderRadius: '0.5px',
    opacity: 0.4,
  },
});

const NavigationSection = styled(Box)({
  flex: 1,
  width: '100%',
  padding: '12px 8px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  // Enhanced scrollbar for better UX
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '2px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.25)',
      width: '6px',
    },
  },
  // Add subtle gradient separators
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '16px',
    right: '16px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
    opacity: 0.8,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '16px',
    right: '16px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    opacity: 0.6,
  },
});

const CollapseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '24px',
  right: '-12px',
  backgroundColor: '#6C5DD3',
  color: 'white',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  width: '24px',
  height: '24px',
  minWidth: '24px',
  zIndex: 1300,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#5a4db0',
    transform: 'translateX(2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const MobileBackdrop = styled(Box)(({ theme }: { theme: Theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  zIndex: 1200,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

interface EnhancedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedCity: string;
  onCitySelect: (city: string) => void;
  isCollapsed?: boolean;
}

const navigationItems = [
  { 
    icon: <DashboardOutlinedIcon />, 
    label: 'Dashboard', 
    path: '/dashboard'
  },
  { 
    icon: <MapOutlinedIcon />, 
    label: 'Map View', 
    path: '/map'
  },
  { 
    icon: <VideocamOutlinedIcon />, 
    label: 'Camera Monitoring', 
    path: '/cameras'
  },
  {
    icon: <DirectionsCarOutlinedIcon />,
    label: 'Parking',
    path: '/parking'
  },
  {
    icon: <NotificationsOutlinedIcon />,
    label: 'Alerts',
    path: '/alerts'
  },
  { 
    icon: <BusinessOutlinedIcon />, 
    label: 'City Updates', 
    path: '/city-updates'
  },
  { 
    icon: <AnalyticsOutlinedIcon />, 
    label: 'Analytics', 
    path: '/analytics'
  },
  { 
    icon: <WarningAmberOutlinedIcon />, 
    label: 'Hazards', 
    path: '/hazards'
  },
  { 
    icon: <SettingsOutlinedIcon />, 
    label: 'Settings', 
    path: '/settings'
  },
];

export function EnhancedSidebar({ isOpen, onToggle, selectedCity, onCitySelect, isCollapsed = false }: EnhancedSidebarProps) {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const location = useLocation();

  const handleMobileClose = () => {
    if (isMobile) {
      onToggle();
    }
  };

  const drawerVariant = isMobile ? 'temporary' : 'persistent';
  const shouldShowBackdrop = isMobile && isOpen;

  return (
    <>
      {shouldShowBackdrop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={handleMobileClose}
        />
      )}
      
      <StyledDrawer
        variant={drawerVariant}
        anchor="left"
        open={isMobile ? isOpen : true}
        onClose={handleMobileClose}
        collapsed={isCollapsed}
        className={!isMobile ? '!block' : ''}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <SidebarContent>

          {/* Header */}
          <SidebarHeader isCollapsed={isCollapsed} />

          {/* Location Selector */}
          <LocationSelector 
            selectedCity={selectedCity}
            onCitySelect={onCitySelect}
            isCollapsed={isCollapsed && !isMobile}
          />

          {/* Navigation */}
          <NavigationSection>
            <List sx={{ 
              padding: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isCollapsed ? 'center' : 'flex-start',
            }}>
              {navigationItems.map((item, index) => (
                <Box
                  key={item.path}
                  sx={{
                    width: '100%',
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                    '@keyframes fadeInUp': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateY(10px)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <NavigationItem
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isCollapsed={isCollapsed && !isMobile}
                  />
                </Box>
              ))}
            </List>
          </NavigationSection>

          {/* Alert Type Filter */}
          <AlertTypeFilter isCollapsed={isCollapsed} />
        </SidebarContent>
      </StyledDrawer>
    </>
  );
}
