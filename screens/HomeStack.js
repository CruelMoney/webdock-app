import React from "react";
import {Text,Button,View} from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";

import {HomeScreen} from "../screens/HomeScreen";
import {ServerManagement} from "../screens/ServerManagement";
import { DrawerContent } from '../screens/DrawerContent';
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../shared/header";
import { IconButton, Colors } from 'react-native-paper';

const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#9AC4F8",
  },
  headerTintColor: "white",
  headerBackTitle: "Back",
};
const MainStackNavigator = ({navigation}) => {
  const openMenu=()=> {
    navigation.openDrawer();
  }
  
  return (
    <Stack.Navigator initialRouteName="Servers" screenOptions={{headerShown:true}}>
      <Stack.Screen name="Servers" component={HomeScreen}
      options={{
        headerTintColor: 'white',
        headerStyle: {
          backgroundColor: '#008570',
          },
        headerShown:true,
        headerLeft: () => <IconButton
        icon="menu"
        color='white'
        size={25}
        onPress={openMenu}
      />
      }}/>
      <Stack.Screen name="ServerManagement" component={ServerManagement}
      options={{
        headerTintColor: 'white',
        headerStyle: {
          backgroundColor: '#008570',
          },headerShown:true
         }}/>
    </Stack.Navigator>
  );
}

export { MainStackNavigator };