import React from 'react';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: '4px 16px',
  marginBottom: '8px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
}));

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'collapsed',
})<{ active?: boolean; collapsed?: boolean }>(({ theme, active, collapsed }) => ({
  borderRadius: collapsed ? '14px' : '12px',
  padding: collapsed ? '16px' : '14px 18px',
  minWidth: collapsed ? '48px' : 'auto',
  minHeight: '48px',
  display: 'flex',
  justifyContent: collapsed ? 'center' : 'flex-start',
  alignItems: 'center',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  margin: '0 auto',
  
  // Enhanced glass morphism background
  background: active 
    ? `
      linear-gradient(
        135deg, 
        rgba(255, 255, 255, 0.25) 0%, 
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.2) 100%
      )
    `
    : 'transparent',
  border: active ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
  backdropFilter: active ? 'blur(10px)' : 'none',
  WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
  boxShadow: active 
    ? `
      0 8px 20px rgba(108, 93, 211, 0.2),
      0 4px 10px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -1px 0 rgba(255, 255, 255, 0.1)
    ` 
    : 'none',
    
  // Subtle inner glow for active state
  '&::before': active ? {
    content: '""',
    position: 'absolute',
    top: '1px',
    left: '1px',
    right: '1px',
    bottom: '1px',
    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%,
        rgba(255, 255, 255, 0.05) 100%
      )
    `,
    borderRadius: collapsed ? '13px' : '11px',
    pointerEvents: 'none',
  } : {},
  
  '&:hover': {
    background: active 
      ? `
        linear-gradient(
          135deg, 
          rgba(255, 255, 255, 0.3) 0%, 
          rgba(255, 255, 255, 0.18) 50%,
          rgba(255, 255, 255, 0.25) 100%
        )
      `
      : `
        linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.12) 0%,
          rgba(255, 255, 255, 0.08) 100%
        )
      `,
    transform: collapsed ? 'scale(1.08) translateY(-1px)' : 'translateX(6px) translateY(-1px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: `
      0 12px 24px rgba(108, 93, 211, 0.15), 
      0 6px 12px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.15)
    `,
  },
  
  '&:active': {
    transform: collapsed ? 'scale(1.02)' : 'translateX(3px)',
    transition: 'all 0.1s ease',
  },
}));

const StyledListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'collapsed',
})<{ active?: boolean; collapsed?: boolean }>(({ theme, active, collapsed }) => ({
  minWidth: collapsed ? 'auto' : '40px',
  margin: 0,
  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  transition: 'all 0.3s ease',
  
  '& svg': {
    width: '1.4rem',
    height: '1.4rem',
    filter: active 
      ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3))' 
      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    transition: 'all 0.3s ease',
  },
  
  // Add subtle glow effect on hover
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-4px',
    left: '-4px',
    right: '-4px',
    bottom: '-4px',
    background: `
      radial-gradient(
        circle,
        ${active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)'} 0%,
        transparent 70%
      )
    `,
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  
  '&:hover::after': {
    opacity: 1,
  },
}));

const StyledListItemText = styled(ListItemText)<{ active?: boolean }>(({ theme, active }) => ({
  marginLeft: '12px',
  
  '& .MuiListItemText-primary': {
    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
    fontWeight: active ? 600 : 500,
    fontSize: '0.95rem',
    letterSpacing: '0.3px',
    lineHeight: 1.2,
    transition: 'all 0.3s ease',
    textShadow: active 
      ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
      : '0 1px 2px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    
    // Add subtle text glow on active
    ...(active && {
      textShadow: `
        0 1px 3px rgba(0, 0, 0, 0.2),
        0 0 8px rgba(255, 255, 255, 0.3)
      `,
    }),
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
