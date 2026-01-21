import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'midnight' | 'sunset' | 'ocean' | 'forest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; preview: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes: { id: Theme; name: string; preview: string }[] = [
  { id: 'dark', name: 'Dark', preview: 'hsl(222.2 84% 4.9%)' },
  { id: 'light', name: 'Light', preview: 'hsl(0 0% 100%)' },
  { id: 'midnight', name: 'Midnight Blue', preview: 'hsl(230 50% 10%)' },
  { id: 'sunset', name: 'Sunset', preview: 'hsl(20 80% 8%)' },
  { id: 'ocean', name: 'Ocean', preview: 'hsl(200 70% 8%)' },
  { id: 'forest', name: 'Forest', preview: 'hsl(150 50% 8%)' },
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('shadow-exchange-theme');
    return (stored as Theme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'midnight', 'sunset', 'ocean', 'forest');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Store in localStorage
    localStorage.setItem('shadow-exchange-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
