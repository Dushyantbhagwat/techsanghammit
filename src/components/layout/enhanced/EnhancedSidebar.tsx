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

const StyledDrawer = styled(Drawer)<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #6C5DD3 0%, #4A3E99 50%, #3D2F7F 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    
    '&:hover': {
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.4)',
        },
      },
    },
    
    '&::-webkit-scrollbar': {
      width: '0px',
      transition: 'width 0.3s ease',
    },
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
  padding: '8px 12px',
  overflowY: 'auto',
  overflowX: 'hidden',
});

const CollapseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  right: '-18px',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '36px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  zIndex: 1000,
  
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'translateY(-50%) scale(1.1)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
  },
  
  '&:active': {
    transform: 'translateY(-50%) scale(0.95)',
  },
}));

const MobileBackdrop = styled(Box)(({ theme }) => ({
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
}

const navigationItems = [
  { 
    icon: <DashboardOutlinedIcon />, 
    label: 'Dashboard', 
    path: '/dashboard',
    notificationCount: 0,
    status: 'online' as const
  },
  { 
    icon: <MapOutlinedIcon />, 
    label: 'Map View', 
    path: '/map',
    notificationCount: 0
  },
  { 
    icon: <VideocamOutlinedIcon />, 
    label: 'Camera Monitoring', 
    path: '/cameras',
    notificationCount: 2,
    status: 'warning' as const
  },
  { 
    icon: <NotificationsOutlinedIcon />, 
    label: 'Alerts', 
    path: '/alerts',
    notificationCount: 12,
    status: 'error' as const
  },
  { 
    icon: <BusinessOutlinedIcon />, 
    label: 'City Updates', 
    path: '/city-updates',
    notificationCount: 0
  },
  { 
    icon: <AnalyticsOutlinedIcon />, 
    label: 'Analytics', 
    path: '/analytics',
    notificationCount: 0,
    status: 'online' as const
  },
  { 
    icon: <WarningAmberOutlinedIcon />, 
    label: 'Hazards', 
    path: '/hazards',
    notificationCount: 5,
    status: 'warning' as const
  },
  { 
    icon: <SettingsOutlinedIcon />, 
    label: 'Settings', 
    path: '/settings',
    notificationCount: 0
  },
];

export function EnhancedSidebar({ isOpen, onToggle, selectedCity, onCitySelect }: EnhancedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const location = useLocation();

  const handleCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

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
        collapsed={isCollapsed && !isMobile}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        <SidebarContent>
          {/* Collapse Button - Desktop Only */}
          {!isMobile && (
            <Tooltip title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
              <CollapseButton onClick={handleCollapse}>
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </CollapseButton>
            </Tooltip>
          )}

          {/* Header */}
          <SidebarHeader isCollapsed={isCollapsed && !isMobile} />

          {/* Location Selector */}
          <LocationSelector 
            selectedCity={selectedCity}
            onCitySelect={onCitySelect}
            isCollapsed={isCollapsed && !isMobile}
          />

          {/* Navigation */}
          <NavigationSection>
            <List sx={{ padding: 0 }}>
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  notificationCount={item.notificationCount}
                  status={item.status}
                  isCollapsed={isCollapsed && !isMobile}
                />
              ))}
            </List>
          </NavigationSection>

          {/* Alert Type Filter */}
          <AlertTypeFilter isCollapsed={isCollapsed && !isMobile} />
        </SidebarContent>
      </StyledDrawer>
    </>
  );
}