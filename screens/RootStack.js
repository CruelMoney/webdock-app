import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import { LoginWebView } from './LoginWebView';
const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: '#9AC4F8',
  },
  headerTintColor: 'white',
  headerBackTitle: 'Back',
};

const RootStack = ({navigation}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LogIn"
        component={LoginWebView}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        name="LogIn2"
        component={LogInScreen}
        options={{headerShown: false}}
      /> */}
      {/* <Stack.Screen
        name="ScanScreen"
        component={ScanQRCode}
        options={{headerShown: false}}
      /> */}
    </Stack.Navigator>
  );
};

export {RootStack};
