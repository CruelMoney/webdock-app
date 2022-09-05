import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {IconButton, Colors, Searchbar} from 'react-native-paper';

import {HomeScreen} from '../screens/HomeScreen';
import {ServerManagement} from '../screens/ServerManagement';
import {DrawerContent} from '../screens/DrawerContent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {EventsScreen} from './EventsScreen';
const Stack = createStackNavigator();

const EventsStackNavigator = ({navigation}) => {
  return (
    <Stack.Navigator initialRouteName="Events" headerMode="screen">
      <Stack.Screen
        name="Events"
        component={EventsScreen}
        options={{
          headerTintColor: 'white',
          headerStyle: {
            backgroundColor: '#008570',
          },
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export {EventsStackNavigator};
