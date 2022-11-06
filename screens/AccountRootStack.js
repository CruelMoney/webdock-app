import React from 'react';
import {Text, Button, View, TextInput} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import {HomeScreen} from '../screens/HomeScreen';
import {DrawerContent} from '../screens/DrawerContent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../shared/header';
import {IconButton, Colors, Searchbar} from 'react-native-paper';
import SearchServers from './SearchServers';
import AccountPublicKeys from './AccountPublicKeys'
import AccountScripts from './AccountScripts'
import Account from './Account';
import CreatePublicKey from './CreatePublicKey';
import CreateAccountScript from './CreateAccountScript'
import EditAccountScript from './EditAccountScript';
import AccountInfo from './AccountInfo';
const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: '#9AC4F8',
  },
  headerTintColor: 'white',
  headerBackTitle: 'Back',
};
const AccountRootStack = ({navigation}) => {
  return (
    <Stack.Navigator
      initialRouteName="Account"
      screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="Account"
        component={Account}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="AccountInfo"
        component={AccountInfo}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="General"
        component={Account}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="PublicKeys"
        component={AccountPublicKeys}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="CreatePublicKeys"
        component={CreatePublicKey}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="Scripts"
        component={AccountScripts}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="CreateAccountScript"
        component={CreateAccountScript}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="EditAccountScript"
        component={EditAccountScript}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
};

export {AccountRootStack};
