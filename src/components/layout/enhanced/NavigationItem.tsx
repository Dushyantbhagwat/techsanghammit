import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Badge, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: '4px 16px',
  marginBottom: '4px',
}));

const StyledListItemButton = styled(ListItemButton)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: '12px',
  padding: '12px 16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  background: active 
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
    : 'transparent',
  backdropFilter: active ? 'blur(10px)' : 'none',
  border: active ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
  boxShadow: active ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover': {
    background: active 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
    transform: 'translateX(4px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
    
    '&::before': {
      opacity: 1,
    },
  },
  
  '&:active': {
    transform: 'translateX(2px) scale(0.98)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)<{ active?: boolean }>(({ theme, active }) => ({
  minWidth: '40px',
  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  
  '& .MuiSvgIcon-root': {
    fontSize: '22px',
    filter: active ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : 'none',
  },
}));

const StyledListItemText = styled(ListItemText)<{ active?: boolean }>(({ theme, active }) => ({
  '& .MuiListItemText-primary': {
    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
    fontWeight: active ? 600 : 500,
    fontSize: '14px',
    letterSpacing: '0.5px',
    transition: 'all 0.3s ease',
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    minWidth: '18px',
    height: '18px',
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  height: '20px',
  fontSize: '10px',
  fontWeight: 'bold',
  borderRadius: '10px',
  '&.status-online': {
    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
    color: 'white',
  },
  '&.status-warning': {
    background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
    color: 'white',
  },
  '&.status-error': {
    background: 'linear-gradient(135deg, #ff5722 0%, #d32f2f 100%)',
    color: 'white',
  },
}));

interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  notificationCount?: number;
  status?: 'online' | 'warning' | 'error';
  isCollapsed?: boolean;
}

export function NavigationItem({ 
  icon, 
  label, 
  path, 
  notificationCount, 
  status,
  isCollapsed = false 
}: NavigationItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  const renderContent = () => (
    <StyledListItemButton active={isActive} component={Link} to={path}>
      <StyledListItemIcon active={isActive}>
        {notificationCount ? (
          <NotificationBadge badgeContent={notificationCount} max={99}>
            {icon}
          </NotificationBadge>
        ) : (
          icon
        )}
      </StyledListItemIcon>
      
      {!isCollapsed && (
        <>
          <StyledListItemText 
            primary={label} 
            active={isActive}
          />
          {status && (
            <StatusChip 
              label={status.toUpperCase()} 
              size="small" 
              className={`status-${status}`}
            />
          )}
        </>
      )}
    </StyledListItemButton>
  );

  return (
    <StyledListItem disablePadding>
      {renderContent()}
    </StyledListItem>
  );
}