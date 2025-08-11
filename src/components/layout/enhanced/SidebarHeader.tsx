import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: '24px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.6s ease',
  },
  '&:hover::before': {
    transform: 'translateX(100%)',
  },
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
});

const LogoAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  fontSize: '18px',
  fontWeight: 'bold',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 6px 25px rgba(102, 126, 234, 0.4)',
  },
}));

const BrandText = styled(Typography)(({ theme }) => ({
  color: 'white',
  fontWeight: 700,
  fontSize: '20px',
  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
}));

const SubtitleText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '12px',
  fontWeight: 500,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
}));

interface SidebarHeaderProps {
  isCollapsed?: boolean;
}

export function SidebarHeader({ isCollapsed = false }: SidebarHeaderProps) {
  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoAvatar>
          UX
        </LogoAvatar>
        {!isCollapsed && (
          <Box>
            <BrandText>UrbanX</BrandText>
            <SubtitleText>Smart City Hub</SubtitleText>
          </Box>
        )}
      </LogoContainer>
    </HeaderContainer>
  );
}