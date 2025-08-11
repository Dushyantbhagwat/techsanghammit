import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: '4px 8px',
  marginBottom: '4px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'collapsed',
})<{ active?: boolean; collapsed?: boolean }>(({ theme, active, collapsed }) => ({
  borderRadius: '8px',
  padding: collapsed ? '12px' : '10px 16px',
  minWidth: collapsed ? '40px' : 'auto',
  minHeight: '40px',
  display: 'flex',
  justifyContent: 'center',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  margin: '0 auto',
  
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: collapsed ? 'scale(1.1)' : 'translateX(3px)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'collapsed',
})<{ active?: boolean; collapsed?: boolean }>(({ theme, active, collapsed }) => ({
  minWidth: 'auto',
  margin: 0,
  color: active ? theme.palette.common.white : 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& svg': {
    width: '1.25rem',
    height: '1.25rem',
  },
}));

const StyledListItemText = styled(ListItemText)<{ active?: boolean }>(({ theme, active }) => ({
  '& .MuiListItemText-primary': {
    color: theme.palette.common.white,
    fontWeight: active ? 600 : 400,
    fontSize: '0.9rem',
  },
}));

interface NavigationItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isCollapsed?: boolean;
}

export function NavigationItem({ 
  icon, 
  label, 
  path, 
  isCollapsed = false 
}: NavigationItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <StyledListItem disablePadding>
      <Link to={path} style={{ textDecoration: 'none', width: '100%' }}>
        <Tooltip title={isCollapsed ? label : ''} placement="right">
          <StyledListItemButton 
            active={isActive} 
            collapsed={isCollapsed}
          >
            <StyledListItemIcon 
              active={isActive} 
              collapsed={isCollapsed}
            >
              {icon}
            </StyledListItemIcon>
            
            {!isCollapsed && (
              <StyledListItemText 
                primary={label} 
                active={isActive}
              />
            )}
          </StyledListItemButton>
        </Tooltip>
      </Link>
    </StyledListItem>
  );
}
