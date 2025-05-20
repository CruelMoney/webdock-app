import React, {
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomSheet, {BottomSheetModal} from '@gorhom/bottom-sheet';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useTheme} from 'react-native-paper';
import MenuIcon from '../assets/menu-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import HomeIcon from '../assets/home-icon.svg';
import ServersIcon from '../assets/servers-icon.svg';
import ChatIcon from '../assets/chat-icon.svg';
import AccountIcon from '../assets/account-icon.svg';
import NotificationIcon from '../assets/notification-bell.svg';
import {Dashboard} from './Dashboard';
import {HomeScreen} from './HomeScreen';
import {AccountRootStack} from './AccountRootStack';
import {DrawerContent} from './DrawerContent';
import {createStackNavigator} from '@react-navigation/stack';
import Chat from './Chat';
const Tab = createBottomTabNavigator();

// Screens
const SettingsScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Settings</Text>
  </View>
);
const DummyScreen = () => <View />;
const CustomBottomSheet = forwardRef((myProps, ref) => {
  // ref
  const bottomSheetRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ['25%'], []);

  useImperativeHandle(
    ref,
    () => {
      return {
        open: () => {
          bottomSheetRef.current?.expand();
        },
        close: () => {
          bottomSheetRef.current?.close();
        },
      };
    },
    [],
  );

  return (
    <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
      <View style={styles.centeredContent}>
        <Text style={styles.textStyle}>{`inside ${myProps.name}`}</Text>
      </View>
    </BottomSheet>
  );
});
const TabComponent = props => {
  const customBottomSheetRef = useRef(null);

  useEffect(() => {
    customBottomSheetRef.current?.open();
  }, []);

  return (
    <View style={styles.centeredContent}>
      <CustomBottomSheet ref={customBottomSheetRef} name={props.route.name} />
    </View>
  );
};

export default function MainTabs() {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%'], []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);
  const theme = useTheme();
  return (
    <>
      <Tab.Navigator
        screenOptions={({navigation}) => ({
          tabBarLabelStyle: {
            paddingTop: 3,
            fontSize: 12,
            lineHeight: 16,
            fontFamily: 'Inter',
            fontWeight: '600',
            color: theme.colors.text,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            position: 'absolute',
            height: 65,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          headerTitleStyle: {
            fontSize: 28,
            fontFamily: 'Poppins',
            fontWeight: '600',
            paddingLeft: 10,
            color: theme.colors.text,
          },
          headerStyle: {
            height: 72,
            backgroundColor: theme.colors.background, // match header to theme
            elevation: 0, // Android shadow
            shadowOpacity: 0, // iOS shadow
            borderBottomWidth: 0, // fallback
          },
          headerRightContainerStyle: {
            paddingRight: 20,
          },
          headerShadowVisible: false,
          headerTintColor: theme.colors.text,
          headerRight: () => (
            <View style={{flexDirection: 'row', gap: 20}}>
              <TouchableOpacity onPress={() => console.log('Btn1')}>
                <NotificationIcon
                  height={28}
                  width={28}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <View style={{width: 10}} />
              <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                <MenuIcon height={28} width={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          ),
        })}>
        <Tab.Screen
          name="Home"
          component={Dashboard}
          options={{
            tabBarIcon: ({focused, color, size}) => (
              <HomeIcon color={theme.colors.text} />
            ),
          }}
        />
        <Tab.Screen
          name="Servers"
          component={HomeScreen}
          options={{
            tabBarIcon: ({focused, color, size}) => (
              <ServersIcon color={theme.colors.text} />
            ),
          }}
        />
        <Tab.Screen
          name={'Plus'}
          component={TabComponent}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({focused}) => (
              <TouchableOpacity onPress={openBottomSheet}>
                <View
                  style={{
                    width: 78,
                    height: 72,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <PlusIcon
                    style={{
                      width: 54,
                      height: 54,
                      marginBottom: 9,
                      tintColor: 'white',
                    }}
                  />
                </View>
              </TouchableOpacity>
            ),
          }}></Tab.Screen>
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            tabBarIcon: ({focused, color, size}) => (
              <ChatIcon color={theme.colors.text} />
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccountRootStack}
          options={{
            tabBarIcon: ({focused, color, size}) => (
              <AccountIcon color={theme.colors.text} />
            ),
          }}
        />
        <Tab.Screen
          name="Menu"
          component={SettingsScreen}
          options={{
            tabBarVisible: false,
            tabBarItemStyle: {display: 'none'},
          }}
        />
      </Tab.Navigator>
      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
        <View style={{padding: 20, backgroundColor: 'red'}}>
          <Text style={{fontSize: 18}}>Bottom Sheet Content</Text>
        </View>
      </BottomSheetModal>
    </>
  );
}
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
