import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {HomeScreen} from "../screens/HomeScreen";
import {ServerManagement} from "../screens/ServerManagement";
import { DrawerContent } from '../screens/DrawerContent';
import Icon from "react-native-vector-icons/MaterialIcons";
const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#9AC4F8",
  },
  headerTintColor: "white",
  headerBackTitle: "Back",
};
const MainStackNavigator = ({navigation}) => {

  return (
    <Stack.Navigator initialRouteName="Servers" headerMode="none">
      <Stack.Screen name="Servers" component={HomeScreen}/>
      <Stack.Screen name="ServerManagement" component={ServerManagement}/>
    </Stack.Navigator>
  );
}

export { MainStackNavigator };