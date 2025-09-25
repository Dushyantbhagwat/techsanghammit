import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: '24px 20px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
  background: `
    linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.3) 100%
    )
  `,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  position: 'relative',
  transition: 'all 0.3s ease',
  
  // Glass morphism enhancements with dark theme
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)',
    opacity: 0.7,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10px',
    right: '10px',
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
    opacity: 0.8,
  },
  
  // Hover effect with darker glass
  '&:hover': {
    background: `
      linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.5) 0%,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0.4) 100%
      )
    `,
  },
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '12px',
  position: 'relative',
});

const LogoAvatar = styled(Avatar)(({ theme }) => ({
  width: 42,
  height: 42,
  background: `
    linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.95) 0%,
      rgba(0, 0, 0, 0.9) 100%
    )
  `,
  color: 'white',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  border: '2px solid rgba(0, 0, 0, 0.4)',
  boxShadow: `
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  
  // Add subtle glow effect
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: `
      linear-gradient(
        135deg,
        rgba(147, 51, 234, 0.3) 0%,
        transparent 50%,
        rgba(108, 93, 211, 0.2) 100%
      )
    `,
    borderRadius: '50%',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  
  '&:hover::before': {
    opacity: 1,
  },
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `
      0 6px 20px rgba(147, 51, 234, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
  },
}));

const BrandText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.95)',
  fontWeight: 700,
  fontSize: '1.25rem',
  letterSpacing: '0.5px',
  textShadow: `
    0 0 10px rgba(108, 93, 211, 0.8),
    0 0 20px rgba(147, 51, 234, 0.6),
    0 0 30px rgba(147, 51, 234, 0.4),
    0 1px 2px rgba(0, 0, 0, 0.3)
  `,
  background: `
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(147, 51, 234, 0.9) 50%,
      rgba(255, 255, 255, 0.8) 100%
    )
  `,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transition: 'all 0.3s ease',
  filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.5))',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-2px',
    left: '-4px',
    right: '-4px',
    bottom: '-2px',
    background: `
      linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.8) 0%,
        rgba(0, 0, 0, 0.6) 50%,
        rgba(0, 0, 0, 0.4) 100%
      )
    `,
    borderRadius: '6px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
    filter: 'blur(8px)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.3)',
  },
  
  '&:hover': {
    transform: 'translateY(-1px)',
    textShadow: `
      0 0 15px rgba(108, 93, 211, 1),
      0 0 25px rgba(147, 51, 234, 0.8),
      0 0 35px rgba(147, 51, 234, 0.6),
      0 2px 4px rgba(0, 0, 0, 0.4)
    `,
    filter: 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.7))',
  },
  
  '&:hover::before': {
    opacity: 1,
  },
});

const SubtitleText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.65)',
  fontSize: '0.8rem',
  fontWeight: 400,
  letterSpacing: '0.3px',
  textShadow: `
    0 0 8px rgba(147, 51, 234, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2)
  `,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: `
      0 0 12px rgba(147, 51, 234, 0.4),
      0 1px 3px rgba(0, 0, 0, 0.3)
    `,
  },
});

interface SidebarHeaderProps {
  isCollapsed?: boolean;
}

export function SidebarHeader({ isCollapsed = false }: SidebarHeaderProps) {
  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoAvatar>
          <span style={{
            fontSize: '1.8rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(147, 51, 234, 0.9) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 20px rgba(147, 51, 234, 0.6)',
            filter: 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))'
          }}>
            ✕
          </span>
        </LogoAvatar>
        {!isCollapsed && (
          <Box>
            <BrandText variant="h6">
              Urban X
            </BrandText>
            <SubtitleText>
              Smart City Management
            </SubtitleText>
          </Box>
        )}
      </LogoContainer>
    </HeaderContainer>
  );
}
