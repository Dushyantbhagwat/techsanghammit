import { createContext, useContext, useState, ReactNode } from 'react';

const CITIES = ["thane", "borivali", "kharghar", "pune", "nashik", "panvel"] as const;
type City = typeof CITIES[number];

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: readonly City[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<string>('pune');

  return (
    <CityContext.Provider value={{
      selectedCity,
      setSelectedCity,
      availableCities: CITIES
    }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
