/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, useColorScheme} from 'react-native';
import {Colors, Provider, useTheme} from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {AuthContext} from './components/context';
import OfflineNotice from './components/OfflineNotice';
import {AccountRootStack} from './screens/AccountRootStack';
import CreateServer from './screens/CreateServer';
import {Dashboard} from './screens/Dashboard';
import {DrawerContent} from './screens/DrawerContent';
import {EventsStackNavigator} from './screens/EventsStack';
import {MainStackNavigator} from './screens/HomeStack';
import {RootStack} from './screens/RootStack';
import {ServerManagement} from './screens/ServerManagement';
import {DefaultTheme, DarkTheme} from 'react-native-paper';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
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
      SplashScreen.hide();
    }
  }, [loginState]);
  const colorScheme = useColorScheme();
  const theme = useTheme();
  theme.dark = colorScheme === 'light';
  // if (loginState.isLoading) {
  //   return (
  //     <LinearGradient
  //       locations={[0.29, 0.8]}
  //       start={{x: 0, y: 0}}
  //       end={{x: 1, y: 0}}
  //       colors={['#00A1A1', '#03A84E']}
  //       style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <SvgLogoWhite />
  //     </LinearGradient>
  //   );
  // }

  return (
    <Provider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          {loginState.userToken !== null ? (
            <>
              <Drawer.Navigator
                screenOptions={{
                  headerShown: false,
                }}
                drawerContent={props => <DrawerContent {...props} />}>
                <Drawer.Screen
                  name="Dashboard"
                  component={Dashboard}
                  options={{
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="Servers"
                  component={MainStackNavigator}
                  options={{
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="Account"
                  component={AccountRootStack}
                  options={{
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="Events"
                  component={EventsStackNavigator}
                  options={{
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="ServerManagement"
                  component={ServerManagement}
                  options={{
                    unmountOnBlur: true,
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="CreateServer"
                  component={CreateServer}
                  options={{
                    unmountOnBlur: true,
                    headerShown: false,
                  }}
                />
              </Drawer.Navigator>
            </>
          ) : (
            <RootStack />
          )}
          <OfflineNotice style={{zIndex: 200000}} />
          <Toast ref={ref => Toast.setRef(ref)} style={{zIndex: 200000}} />
        </NavigationContainer>
        <OfflineNotice style={{zIndex: 200000}} />
        <Toast ref={ref => Toast.setRef(ref)} style={{zIndex: 200000}} />
      </AuthContext.Provider>
    </Provider>
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
});
