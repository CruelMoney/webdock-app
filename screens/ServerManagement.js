import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {View , Button,Text} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { LogInScreen } from './LogInScreen';
import { HomeScreen } from './HomeScreen';
import ServerOverview from './ServerOverview';
import ServerActivity from './ServerActivity';
import ServerEvents from './ServerEvents';
import ServerSnapshots from './ServerSnapshots';
import ServerShellUsers from './ServerShellUsers';
import ServerScripts from './ServerScripts';
import Header from '../shared/header';

const Tab = createMaterialTopTabNavigator();
export function ServerManagement({navigation}){
    return(
        <Tab.Navigator
        swipeEnabled={true}
        tabBarOptions={{
            scrollEnabled:true,
            activeTintColor: 'white',
            labelStyle: { fontSize: 12,fontWeight:'bold' },
            style: {
                backgroundColor: '#008570',
                borderColor: '#008570',
                activeTintColor: "white",
                borderTopColor: 'transparent',
            },
            indicatorStyle: {
                backgroundColor:'white'
            }
        }}>
            <Tab.Screen name="Overview" component={ServerOverview} />
            <Tab.Screen name="Activity" component={ServerActivity} />
            <Tab.Screen name="Events" component={ServerEvents}  />
            <Tab.Screen name="Snapshots" component={ServerSnapshots} />
            <Tab.Screen name="Shell Users" component={ServerShellUsers} />
            <Tab.Screen name="Scripts" component={ServerScripts} />
        </Tab.Navigator>
    )
}