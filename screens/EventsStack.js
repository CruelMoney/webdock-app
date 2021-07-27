import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {IconButton, Colors, Searchbar} from 'react-native-paper';

import {HomeScreen} from '../screens/HomeScreen';
import {ServerManagement} from '../screens/ServerManagement';
import {DrawerContent} from '../screens/DrawerContent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {EventsScreen} from './EventsScreen';
import CreatePublicKey from './CreatePublicKey';
const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: '#9AC4F8',
  },
  headerTintColor: 'white',
  headerBackTitle: 'Back',
};

const EventsStackNavigator = ({navigation}) => {
  const openMenu = () => {
    navigation.openDrawer();
  };
  const openSearch = () => {
    navigation.openDrawer();
  };
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
          headerShown: true,
          headerLeft: () => (
            <IconButton
              icon="menu"
              color="white"
              size={25}
              onPress={openMenu}
            />
          ),
          headerRight: () => (
            <IconButton
              icon="magnify"
              color="white"
              size={25}
              onPress={openSearch}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export {EventsStackNavigator};
