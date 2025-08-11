import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(0, 0, 0, 0.1)',
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
});

const LogoAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: '1rem',
  fontWeight: 'bold',
}));

const BrandText = styled(Typography)({
  color: 'white',
  fontWeight: 600,
  fontSize: '1.1rem',
});

const SubtitleText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.75rem',
});

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
