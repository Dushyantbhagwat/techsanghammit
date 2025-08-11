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
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #6C5DD3 0%, #4A3E99 50%, #3D2F7F 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: theme.transitions.create(['width', 'transform'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const SidebarContent = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

const NavigationSection = styled(Box)({
  flex: 1,
  width: '100%',
  padding: '8px 4px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
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

  const drawerVariant = isMobile ? 'temporary' : 'permanent';
  const shouldShowBackdrop = isMobile && isOpen;

  return (
    <>
      {shouldShowBackdrop && <MobileBackdrop onClick={handleMobileClose} />}
      
      <StyledDrawer
        variant={drawerVariant}
        anchor="left"
        open={isMobile ? isOpen : true}
        onClose={handleMobileClose}
        collapsed={isCollapsed}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <SidebarContent>
          {/* Removed the collapse button from here as it's now in the header */}

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
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  isCollapsed={isCollapsed && !isMobile}
                />
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
