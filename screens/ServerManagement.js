import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useFocusEffect} from 'react';
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
import {IconButton} from 'react-native-paper';
import {getServerBySlug} from '../service/servers';

const Tab = createMaterialTopTabNavigator();
export function ServerManagement({route, navigation}) {
  useEffect(() => {
    setTimeout(() => {
      navigation.setOptions({
        headerTitle: route.params.slug,
        headerRight: () => (
          <IconButton
            icon="pencil"
            color="white"
            size={25}
            onPress={() =>
              navigation.navigate('UpdateServerMetadata', {
                slug: route.params.slug,
                name: route.params.name,
                description: route.params.description,
                notes: route.params.notes,
                nextActionDate: route.params.nextActionDate,
              })
            }
          />
        ),
      });
    }, 0);
  }, [route]);
  return (
    <Tab.Navigator
      swipeEnabled={true}
      tabBarOptions={{
        scrollEnabled: true,
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
      <Tab.Screen
        name="Overview"
        component={ServerOverview}
        initialParams={{slug: route.params.slug}}
      />
      <Tab.Screen
        name="Activity"
        component={ServerActivity}
        initialParams={{slug: route.params.slug}}
      />
      <Tab.Screen
        name="Events"
        component={ServerEvents}
        initialParams={{slug: route.params.slug}}
      />
      <Tab.Screen
        name="Snapshots"
        component={ServerSnapshots}
        initialParams={{slug: route.params.slug}}
      />
      <Tab.Screen
        name="Shell Users"
        component={ServerShellUsers}
        initialParams={{slug: route.params.slug}}
      />
      <Tab.Screen
        name="Scripts"
        component={ServerScripts}
        initialParams={{slug: route.params.slug}}
      />
    </Tab.Navigator>
  );
}
