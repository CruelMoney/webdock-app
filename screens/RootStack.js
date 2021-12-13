import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {LogInScreen} from '../screens/LogInScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScanQRCode from './ScanQRCode';
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
        component={LogInScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ScanScreen"
        component={ScanQRCode}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export {RootStack};
