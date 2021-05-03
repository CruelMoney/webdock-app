import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {View , Button,Text} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LogInScreen } from './LogInScreen';
import { HomeScreen } from './HomeScreen';

const Tab = createMaterialTopTabNavigator();
export function ServerManagement({navigation}){
    return(
        <Tab.Navigator 
        tabBarOptions={{
            activeTintColor: 'white',
            labelStyle: { fontSize: 12,fontWeight:'bold' },
            style: {
                backgroundColor: '#008570',
                borderColor: '#008570',
                activeBackgroundColor: "#090D20",
                borderTopColor: 'transparent',
            },
        }}>
            <Tab.Screen name="LogInScreen" component={LogInScreen} />
            <Tab.Screen name="HomeScreen" component={HomeScreen} />
        </Tab.Navigator>
    )
}