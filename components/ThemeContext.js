import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useEffect, useState} from 'react';
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
    menu: {
      background: 'white',
      surface: '#F3F3F3',
      text: 'white',
    },
    restartButton: {
      background: '#02221326',
      text: 'black',
    },
    startButton: {
      background: '#b2ffc8',
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
    menu: {
      background: '#022213',
      surface: '#1E392B',
      text: 'white',
    },
    restartButton: {
      background: '#284336',
      text: 'white',
    },
  },
};
const THEME_KEY = 'APP_THEME';

export const ThemeProvider = ({children}) => {
  const [currentTheme, setCurrentTheme] = useState(false);

  useEffect(() => {
    // Load theme preference from storage
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setCurrentTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async option => {
    const newTheme = option.key;
    setCurrentTheme(newTheme);
    await AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const theme = currentTheme == 'dark' ? darkTheme : lightTheme;
  const isDark = currentTheme == 'dark';
  return (
    <ThemeContext.Provider value={{theme, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};
