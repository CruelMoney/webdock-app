/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useEffect} from 'react';
import {
  ActivityIndicator,
  HeaderBarItem,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from './screens/DrawerContent';
import Header from './shared/header';
import { LogInScreen } from './screens/LogInScreen';
import EventsScreen from './screens/EventsScreen';
import {MainStackNavigator} from './screens/HomeStack';
import { RootStack } from './screens/RootStack';
import { AuthContext } from './components/context';
import AsyncStorage from '@react-native-community/async-storage';
import { EventsStackNavigator } from './screens/EventsStack';
import { HeaderBackButton } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();

export default function App(){
  //const [isLoading, setIsLoading] = React.useState(true);
  //const [userToken, setUserToken] = React.useState(null);
  
  const initialLoginState = {
    isLoading:true,
    userToken:null,
  }

  const loginReducer = ( prevState, action) => {
    switch(action.type){
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken:action.token,
          isLoading:false
        };
      case 'LOGIN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading:false
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userToken:null,
          isLoading:false
        };
    }
  }

  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState)

  const authContext = React.useMemo(()=>({
    signIn:async (utoken)=>{
      // setUserToken('fgkj');
      try{
        await AsyncStorage.setItem('userToken',utoken);
      }catch(e){
        alert(e);
      }
      dispatch({
        type: 'LOGIN',
        token: utoken
      })
    },
    signOut:async()=>{
      try{
        await AsyncStorage.removeItem('userToken');
      } catch(e){
        alert(e);
      }
      dispatch({ type: 'LOGOUT'})
    }
  }));

  useEffect(() => {
    setTimeout(async() => {
      //setIsLoading(false);
      let userToken=null;
      try {
        userToken=await AsyncStorage.getItem('userToken');
      }catch(e){
        alert(e);
      }
      dispatch({ type: 'RETRIEVE_TOKEN', token: userToken });
    },1000);
  }, []);

  if( loginState.isLoading ) {
    return(
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  return(
    <AuthContext.Provider value={authContext}>
    <NavigationContainer>
      { loginState.userToken!==null?(
        <Drawer.Navigator screenOptions={{ headerShown: true }} 
            drawerContent={props => <DrawerContent {...props} />}>
         <Drawer.Screen name="Servers" component={MainStackNavigator}
          options={{
           headerTintColor: 'white',
           headerStyle: {
             backgroundColor: '#008570',
             },headerShown:true
            }}
          />
          <Drawer.Screen name="ServerManagement" component={MainStackNavigator}
          options={{
           headerTintColor: 'white',
           headerStyle: {
             backgroundColor: '#008570',
             },headerShown:false
          ,
              headerLeft: (props) => (
                <HeaderBackButton
                  {...props}
                  onPress={() => {
                    // Do something
                  }}
                />
              ),}}
          />
          <Drawer.Screen name="Events" component={EventsStackNavigator}
          options={{
           headerTintColor: 'white',
           headerStyle: {
             backgroundColor: '#008570',
             },headerShown:true
            }}
          />
        </Drawer.Navigator>
      ):
      <RootStack/>
      }
      
    </NavigationContainer>
    </AuthContext.Provider>
  )
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
