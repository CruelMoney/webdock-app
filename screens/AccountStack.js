import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {View, Button, Text} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {LogInScreen} from './LogInScreen';
import {HomeScreen} from './HomeScreen';
import ServerOverview from './ServerOverview';
import ServerActivity from './ServerActivity';
import ServerEvents from './ServerEvents';
import ServerSnapshots from './ServerSnapshots';
import ServerShellUsers from './ServerShellUsers';
import ServerScripts from './ServerScripts';
import Header from '../shared/header';
import AccountInfo from './AccountInfo';
import AccountPublicKeys from './AccountPublicKeys';
import AccountScripts from './AccountScripts';

const Tab = createMaterialTopTabNavigator();
export function AccountStack({navigation}) {
  return (
    <>
      <Tab.Navigator
        swipeEnabled={true}
        tabBarStyle={{ display: 'none' }}
        tabBarOptions={{
          activeTintColor: 'white',
          labelStyle: {fontSize: 12, fontWeight: 'bold'},
          style: {
            backgroundColor: '#008570',
            borderColor: '#008570',
            activeTintColor: 'white',
            borderTopColor: 'transparent',
          },
          indicatorStyle: {
            backgroundColor: 'white',
          },
        }}>
        <Tab.Screen name="Account" component={AccountInfo} />
        <Tab.Screen name="Public Keys" component={AccountPublicKeys} />
        <Tab.Screen name="Scripts" component={AccountScripts} />
      </Tab.Navigator>
    </>
  );
}
