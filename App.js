/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  HeaderBarItem,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
import {Provider} from 'react-native-paper';
import Modal from 'react-native-modal';
import {NavigationContainer, StackActions} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {DrawerContent} from './screens/DrawerContent';
import Header from './shared/header';
import {LogInScreen} from './screens/LogInScreen';
import EventsScreen from './screens/EventsScreen';
import {MainStackNavigator} from './screens/HomeStack';
import {RootStack} from './screens/RootStack';
import {AuthContext} from './components/context';
import AsyncStorage from '@react-native-community/async-storage';
import {EventsStackNavigator} from './screens/EventsStack';
import {createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
import {AccountStack} from './screens/AccountStack';
import {IconButton} from 'react-native-paper';
import CreateAccountScript from './screens/CreateAccountScript';
import {AccountRootStack} from './screens/AccountRootStack';
import Toast from 'react-native-toast-message';
import UpdateServerMetadata from './screens/UpdateServerMetadata';
import CreateServerScript from './screens/CreateServerScript';
import NetInfo from "@react-native-community/netinfo";
import { useState } from 'react/cjs/react.development';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
export default function App() {
  //const [isLoading, setIsLoading] = React.useState(true);
  //const [userToken, setUserToken] = React.useState(null);

  const initialLoginState = {
    isLoading: true,
    userToken: null,
  };
  const [netModalIsVisible,setNetModalIsVisible]=useState();


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
      // setUserToken('fgkj');
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
      NetInfo.fetch().then((status)=>{
        if(status.isConnected){
          setNetModalIsVisible(false);
        }else{
          setNetModalIsVisible(true);
        }
      })
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        alert(e);
      }
      dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
    }, 1000);
  }, []);

  if (loginState.isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#008570" />
      </View>
    );
  }

  return (
    <Provider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          {loginState.userToken !== null ? (
            <>
              <Drawer.Navigator
                screenOptions={{headerShown: false}}
                drawerContent={props => <DrawerContent {...props} />}>
                <Drawer.Screen
                  name="Servers"
                  component={MainStackNavigator}
                  options={{
                    headerTintColor: 'white',
                    headerStyle: {
                      backgroundColor: '#008570',
                    },
                    headerShown: false,
                  }}
                />
                <Drawer.Screen
                  name="Account"
                  component={AccountStack}
                  options={{
                    headerTintColor: 'white',
                    headerStyle: {
                      backgroundColor: '#008570',
                    },
                    headerShown: true,
                  }}
                />
                <Drawer.Screen
                  name="Events"
                  component={EventsStackNavigator}
                  options={{
                    headerTintColor: 'white',
                    headerStyle: {
                      backgroundColor: '#008570',
                    },
                    headerShown: false,
                    headerRight: () => (
                      <IconButton icon="magnify" color="white" size={25} />
                    ),
                  }}
                />
                <Drawer.Screen
                  name="CreateAccountScript"
                  component={CreateAccountScript}
                />
                <Drawer.Screen
                  name="CreateServerScript"
                  component={CreateServerScript}
                />
              </Drawer.Navigator>
            </>
          ) : (
            <RootStack />
          )}
          <Toast ref={ref => Toast.setRef(ref)} style={{zIndex:200000}}/>
        </NavigationContainer>
        <Toast ref={ref => Toast.setRef(ref)} style={{zIndex:200000}} />
      </AuthContext.Provider>
      <Modal isVisible={netModalIsVisible}>
            <View>
              <Text>Ska internet</Text>
            </View>
      </Modal>
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
