import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Collapse, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const SelectorContainer = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
}));

const HeaderButton = styled(ListItemButton)({
  borderRadius: '8px',
  padding: '12px',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

const ExpandIcon = styled(ExpandMoreIcon)<{ expanded: boolean }>(({ expanded }) => ({
  color: 'rgba(255, 255, 255, 0.8)',
  transition: 'transform 0.3s ease',
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
}));

const CityList = styled(List)(({ theme }) => ({
  padding: '8px 0',
  marginTop: '8px',
}));

const CityItem = styled(ListItemButton)<{ selected?: boolean }>(({ theme, selected }) => ({
  borderRadius: '6px',
  margin: '4px 0',
  padding: '8px 12px',
  backgroundColor: selected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}));

const CityText = styled(Typography)<{ selected?: boolean }>(({ selected }) => ({
  color: selected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
  fontSize: '13px',
  fontWeight: selected ? 600 : 400,
  transition: 'all 0.3s ease',
}));

const HeaderText = styled(Typography)({
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: 500,
});

const SubHeaderText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.75rem',
});

interface LocationSelectorProps {
  selectedCity: string;
  onCitySelect: (city: string) => void;
  isCollapsed?: boolean;
}

const cities = [
  { id: 'thane', name: 'Thane', population: '1.8M' },
  { id: 'borivali', name: 'Borivali', population: '1.2M' },
  { id: 'kharghar', name: 'Kharghar', population: '0.8M' },
  { id: 'pune', name: 'Pune', population: '3.1M' },
  { id: 'nashik', name: 'Nashik', population: '1.5M' },
  { id: 'panvel', name: 'Panvel', population: '0.9M' },
];

export function LocationSelector({ selectedCity, onCitySelect, isCollapsed = false }: LocationSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const selectedCityData = cities.find(city => city.id === selectedCity);

  if (isCollapsed) {
    return (
      <SelectorContainer>
        <IconButton 
          size="small" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
          }}
        >
          <LocationOnOutlinedIcon />
        </IconButton>
      </SelectorContainer>
    );
  }

  return (
    <SelectorContainer>
      <HeaderButton onClick={() => setIsExpanded(!isExpanded)}>
        <ListItemIcon sx={{ minWidth: '32px' }}>
          <LocationOnOutlinedIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px' }} />
        </ListItemIcon>
        <ListItemText
          primary={<HeaderText>{selectedCityData ? selectedCityData.name : 'Select City'}</HeaderText>}
          secondary={<SubHeaderText>{selectedCityData ? `${selectedCityData.population} residents` : ''}</SubHeaderText>}
        />
        <ExpandIcon expanded={isExpanded} />
      </HeaderButton>
      
      <Collapse in={isExpanded} timeout={300}>
        <CityList>
          {cities.map((city) => (
            <CityItem
              key={city.id}
              selected={selectedCity === city.id}
              onClick={() => onCitySelect(city.id)}
            >
              <ListItemIcon sx={{ minWidth: '24px' }}>
                {selectedCity === city.id ? (
                  <RadioButtonCheckedIcon sx={{ color: '#ffffff', fontSize: '16px' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={<CityText selected={selectedCity === city.id}>{city.name}</CityText>}
              />
            </CityItem>
          ))}
        </CityList>
      </Collapse>
    </SelectorContainer>
  );
}
