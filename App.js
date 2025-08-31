/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
// import SplashScreen from 'react-native-splash-screen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ThemeProvider} from './components/ThemeContext';
import WebdockApp from './WebdockApp';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';
import {hideSplash, showSplash} from 'react-native-splash-view';

// const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export default function App() {
  //const [isLoading, setIsLoading] = React.useState(true);
  //const [userToken, setUserToken] = React.useState(null);

  const initialLoginState = {
    isLoading: true,
    userToken: null,
  };
  const [netModalIsVisible, setNetModalIsVisible] = useState();

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userToken: null,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const authContext = React.useMemo(() => ({
    signIn: async utoken => {
      try {
        await AsyncStorage.setItem('userToken', utoken);
      } catch (e) {
        alert(e);
      }
      dispatch({
        type: 'LOGIN',
        token: utoken,
      });
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        alert(e);
      }
      dispatch({type: 'LOGOUT'});
    },
  }));

  useEffect(() => {
    setTimeout(async () => {
      //setIsLoading(false);
      NetInfo.fetch().then(status => {
        if (status.isConnected) {
          setNetModalIsVisible(false);
        } else {
          setNetModalIsVisible(true);
        }
      });
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        alert(e);
      }
      dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
    }, 0);
  }, []);

  useEffect(() => {
    if (loginState.isLoading == false) {
      const init = async () => {
        // …do multiple sync or async tasks
      };
      init().finally(async () => {
        if ((await AsyncStorage.getItem('userToken')) == null) {
          setTimeout(() => {
            hideSplash();
          }, 3000);
        }
      });
    }
  }, [loginState]);
  const theme = useTheme();
  return (
    <GestureHandlerRootView
      style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ThemeProvider>
        <SafeAreaProvider>
          <WebdockApp />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  tooltip: {
    width: 280,
    padding: 20,
    borderRadius: 4,
    gap: 20,
  },
  tooltipTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
  },
  tooltipText: {
    fontFamily: 'Poppins',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
