import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import {HomeScreen} from "../screens/HomeScreen";
import {ServerManagement} from "../screens/ServerManagement";
import { DrawerContent } from '../screens/DrawerContent';
import Icon from "react-native-vector-icons/MaterialIcons";
import { EventsScreen } from "./EventsScreen";
const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#9AC4F8",
  },
  headerTintColor: "white",
  headerBackTitle: "Back",
};

const EventsStackNavigator = ({navigation}) => {
  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="Events" component={EventsScreen}/>
    </Stack.Navigator>
  );
}

export { EventsStackNavigator };