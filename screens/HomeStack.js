import React from 'react';
import {Text, Button, View, TextInput} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import {HomeScreen} from '../screens/HomeScreen';
import {ServerManagement} from '../screens/ServerManagement';
import {DrawerContent} from '../screens/DrawerContent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../shared/header';
import {IconButton, Colors, Searchbar} from 'react-native-paper';
import SearchServers from './SearchServers';

const Stack = createStackNavigator();

const MainStackNavigator = ({navigation}) => {

  return (
    <Stack.Navigator
      initialRouteName="Servers"
      screenOptions={{headerShown: true}}>
      <Stack.Screen
        name="Servers"
        component={HomeScreen}
        options={{
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: '#008570',
          },
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ServerManagement"
        component={ServerManagement}
        options={{
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: '#008570',
          },
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export {MainStackNavigator};
