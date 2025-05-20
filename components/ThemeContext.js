import React, {createContext, useState} from 'react';
import {DefaultTheme, MD3DarkTheme} from 'react-native-paper';

export const ThemeContext = createContext();

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#01FF48',
    primaryText: '#01AF35',
    background: '#E8EFE8',
    surface: 'white',
    onAccentText: 'white',
    accent: '#022213',
    text: 'black',
    myOwnColor: '#BADA55',
    themeSwitch: {
      primary: '#FFFFFF80',
      secondary: '#FFFFFF',
      text: 'black',
    },
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#01FF48',
    primaryText: '#01AF35',
    background: '#1E392B',
    surface: '#022213',
    accent: '#38604B',
    onAccentText: 'white',
    text: 'white',
    myOwnColor: '#BADA55',
    themeSwitch: {
      primary: '#02221380',
      secondary: '#284336',
      text: 'white',
    },
  },
};

export const ThemeProvider = ({children}) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(prev => !prev);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
