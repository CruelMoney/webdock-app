import React, {
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  CONTENT_HEIGHT,
} from '@gorhom/bottom-sheet';
import {Pressable, TouchableOpacity} from 'react-native-gesture-handler';
import {Divider, useTheme, Button} from 'react-native-paper';
import MenuIcon from '../assets/menu-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import CloseIcon from '../assets/close-icon.svg';
import HomeIcon from '../assets/home-icon.svg';
import ServersIcon from '../assets/servers-icon.svg';
import ChatIcon from '../assets/chat-icon.svg';
import AccountIcon from '../assets/account-icon.svg';
import CreateServerIcon from '../assets/create-server.svg';
import ReferAFriendIcon from '../assets/refer-friend.svg';
import FeatureIcon from '../assets/feature-icon.svg';
import NotificationIcon from '../assets/notification-bell.svg';
import {Dashboard} from './Dashboard';
import {HomeScreen} from './HomeScreen';
import {AccountRootStack} from './AccountRootStack';
import {DrawerContent} from './DrawerContent';
import Chat from './Chat';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {CopilotStep, walkthroughable} from 'react-native-copilot';
import {ServerManagement} from './ServerManagement';
import Account from './Account';
const Tab = createBottomTabNavigator();

function RotatingTabIcon({isOpen, onPress}) {
  const rotation = useSharedValue(0);

  // Animate when isOpen changes
  React.useEffect(() => {
    rotation.value = withTiming(isOpen ? 45 : 0, {duration: 200});
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={animatedStyle}>
        <PlusIcon
          style={{
            width: 54,
            height: 54,
            marginBottom: 9,
            tintColor: 'white',
          }}
        />
      </Animated.View>
    </Pressable>
  );
}
const DummyScreen = () => {
  return <View></View>;
};

export default function MainTabs({navigation}) {
  const bottomSheetRef = useRef(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleSheet = useCallback(() => {
    if (sheetOpen) {
      bottomSheetRef.current?.close(); // close sheet
    } else {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.snapToIndex(0); // open sheet
      });
    }
  }, [sheetOpen]);

  const handleSheetChange = index => {
    setSheetOpen(index !== -1); // index -1 means closed
  };
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const WalkthroughablePressable = walkthroughable(Pressable);
  const WalkthroughableView = walkthroughable(View);

  return (
    <>
      <Tab.Navigator
        screenOptions={({route, navigation}) => ({
          tabBarInactiveTintColor: theme.colors.text,
          tabBarLabelStyle: {
            paddingTop: 3,
            fontSize: 12,
            lineHeight: 16,
            fontFamily: 'Poppins-Regular',
            fontWeight: '4600',
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 65 + insets.bottom,
            zIndex: 100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          headerTitleStyle: {
            fontSize: 28,
            fontFamily: 'Poppins-SemiBold',
            fontWeight: '600',
            color: theme.colors.text,
          },
          headerStyle: {
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
            <View style={{flexDirection: 'row', gap: 10}}>
              <CopilotStep
                text="Notification center|Click the notification icon to open up your Server Alerts and Event log to keep up with important information about your servers."
                order={2}
                name="openNotificationCenter">
                <WalkthroughablePressable onPress={() => console.log('Btn1')}>
                  <NotificationIcon
                    height={28}
                    width={28}
                    color={theme.colors.text}
                  />
                </WalkthroughablePressable>
              </CopilotStep>

              {route.name === 'Menu' ? (
                <Pressable onPress={() => navigation.goBack()}>
                  <CloseIcon height={28} width={28} color={theme.colors.text} />
                </Pressable>
              ) : (
                <Pressable onPress={() => navigation.navigate('Menu')}>
                  <MenuIcon height={28} width={28} color={theme.colors.text} />
                </Pressable>
              )}
            </View>
          ),
        })}
        screenListeners={{
          tabPress: e => {
            if (e.target?.includes('Plus')) {
              e.preventDefault();
              toggleSheet();
            }
          },
        }}>
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
          component={DummyScreen}
          options={{
            tabBarLabel: '',
            tabBarIcon: ({focused}) => (
              <CopilotStep
                text="Action button|Use the “+” button to quickly create a server, refer a friend or start a feature request."
                order={1}
                name="openActionButton">
                <WalkthroughableView
                  style={{
                    width: 78,
                    height: 72,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <RotatingTabIcon isOpen={sheetOpen} onPress={toggleSheet} />
                </WalkthroughableView>
              </CopilotStep>
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
          component={Account}
          options={{
            tabBarIcon: ({focused, color, size}) => (
              <AccountIcon color={theme.colors.text} />
            ),
          }}
        />
        <Tab.Screen
          name="Menu"
          component={DrawerContent}
          options={{
            tabBarStyle: {display: 'none'},
            tabBarItemStyle: {display: 'none'},
          }}
        />
        <Tab.Screen
          name="ServerManagement"
          component={ServerManagement}
          options={{
            tabBarItemStyle: {display: 'none'},
          }}
        />
      </Tab.Navigator>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enableDynamicSizing
        onChange={handleSheetChange}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.text,
        }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}>
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.sheetContent,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: 65 + insets.bottom + 20,
            },
          ]}>
          <Pressable
            onPress={() =>
              navigation.navigate('WebViewScreen', {
                uri: 'https://webdock.io/en/pricing',
                token: 'abc123',
              })
            }>
            <View style={{flexDirection: 'row', gap: 16}}>
              <CreateServerIcon
                width={40}
                height={40}
                color={theme.colors.text}
              />
              <View>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontWeight: '600',
                    fontSize: 16,
                    color: theme.colors.text,
                  }}>
                  Create new server
                </Text>
                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: '300',
                    fontSize: 12,
                    color: theme.colors.text,
                  }}>
                  Create any VPS server profile you would like
                </Text>
              </View>
            </View>
          </Pressable>
          <Divider />
          <Pressable>
            <View style={{flexDirection: 'row', gap: 16}}>
              <ReferAFriendIcon
                width={40}
                height={40}
                color={theme.colors.text}
              />
              <View style={{gap: 20}}>
                <View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontWeight: '600',
                      fontSize: 16,
                      color: theme.colors.text,
                    }}>
                    Refer a Friend
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: '300',
                      fontSize: 12,
                      color: theme.colors.text,
                    }}>
                    Invite friends and earn Credits to use for payment
                  </Text>
                </View>
                <View style={{flexDirection: 'row', gap: 12}}>
                  <Button
                    mode="contained"
                    textColor={theme.colors.text}
                    icon="share-variant"
                    compact
                    style={{
                      borderRadius: 4,
                      minWidth: 0,
                      paddingHorizontal: 8,
                    }}
                    labelStyle={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 12,
                      lineHeight: 12 * 1.2,
                      fontWeight: '600',
                      color: 'black',
                    }}
                    onPress={() =>
                      navigation.navigate('WebViewScreen', {
                        uri: 'https://webdock.io/en/become-an-affiliate',
                        token: 'abc123',
                      })
                    }>
                    Share code
                  </Button>
                  <Button
                    mode="outlined"
                    textColor={theme.colors.text}
                    icon="open-in-new"
                    compact
                    style={{
                      borderColor: theme.colors.primary,
                      borderRadius: 4,
                      minWidth: 0,
                      paddingHorizontal: 8,
                    }}
                    labelStyle={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 12,
                      lineHeight: 12 * 1.2,
                      fontWeight: '600',
                      includeFontPadding: false,
                      color: theme.colors.text,
                    }}
                    onPress={() =>
                      navigation.navigate('WebViewScreen', {
                        uri: 'https://webdock.io/en/become-an-affiliate',
                        token: 'abc123',
                      })
                    }>
                    Read more
                  </Button>
                </View>
              </View>
            </View>
          </Pressable>
          <Divider />
          <Pressable
            onPress={() =>
              navigation.navigate('WebViewScreen', {
                uri: 'https://feedback.webdock.io/',
                token: 'abc123',
              })
            }>
            <View style={{flexDirection: 'row', gap: 16}}>
              <FeatureIcon width={40} height={40} color={theme.colors.text} />
              <View>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontWeight: '600',
                    fontSize: 16,
                    color: theme.colors.text,
                  }}>
                  Submit a feature request
                </Text>
                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: '300',
                    fontSize: 12,
                    color: theme.colors.text,
                  }}>
                  Tell us how we could make the product more useful
                </Text>
              </View>
            </View>
          </Pressable>
          <Divider />
        </BottomSheetScrollView>
      </BottomSheet>
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
  fullScreenContainer: {
    flex: 1, // ✅ Crucial: allows layout and BottomSheet sizing
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetContent: {
    paddingBottom: 80,
    paddingHorizontal: 30,
    paddingTop: 10,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sheetButton: {
    fontSize: 16,
    color: '#3366FF',
    paddingVertical: 10,
  },
});
