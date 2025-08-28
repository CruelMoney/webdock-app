import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Button, Provider} from 'react-native-paper';
// import SplashScreen from 'react-native-splash-screen';
import Toast from 'react-native-toast-message';
import {AuthContext} from './components/context';
import OfflineNotice from './components/OfflineNotice';
import {RootStack} from './screens/RootStack';
import MainTabs from './screens/MainTabs';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ThemeContext} from './components/ThemeContext';
import CrispChat, {
  configure,
  setUserEmail,
  setUserNickname,
  setUserPhone,
  setTokenId,
  resetSession,
} from 'react-native-crisp-chat-sdk';
import {CopilotProvider, useCopilot} from 'react-native-copilot';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AccountPublicKeys from './screens/AccountPublicKeys';
import WebViewScreen from './screens/WebViewScreen';
import AccountScripts from './screens/AccountScripts';
import EditAccountScript from './screens/EditAccountScript';
import {WebViewWebdockAI} from './screens/WebViewWebdockAI';
import ServerScripts from './screens/ServerScripts';
import ServerShellUsers from './screens/ServerShellUsers';
import ServerSnapshots from './screens/ServerSnapshots';
import ServerEvents from './screens/ServerEvents';
import ServerActivity from './screens/ServerActivity';
import NotificationCenter from './screens/NotificationCenter';
import {ServerConsole} from './screens/ServerConsole';
import ThemeSwitch from './components/ThemeSwitch';
export default function WebdockApp() {
  //const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  configure('a3c561be-1f43-4c0e-aa0f-6c88579e55a9');

  const initialLoginState = {
    isLoading: true,
    userToken: null,
  };
  const [netModalIsVisible, setNetModalIsVisible] = useState();
  const Stack = createNativeStackNavigator();
  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGIN':
        return {
          ...prevState,
          userToken: action.token,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userToken: null,
          isLoading: false,
        };
    }
  };

  const [loginState, dispatch] = React.useReducer(
    loginReducer,
    initialLoginState,
  );

  const authContext = React.useMemo(() => ({
    signIn: async utoken => {
      try {
        await AsyncStorage.setItem('userToken', utoken);
      } catch (e) {
        alert(e);
      }
      dispatch({
        type: 'LOGIN',
        token: utoken,
      });
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        alert(e);
      }
      dispatch({type: 'LOGOUT'});
    },
  }));

  useEffect(() => {
    setTimeout(async () => {
      //setIsLoading(false);
      NetInfo.fetch().then(status => {
        if (status.isConnected) {
          setNetModalIsVisible(false);
        } else {
          setNetModalIsVisible(true);
        }
      });
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        alert(e);
      }
      dispatch({type: 'RETRIEVE_TOKEN', token: userToken});
    }, 0);
  }, []);

  useEffect(() => {
    if (loginState.isLoading == false) {
      // SplashScreen.hide();
    }
  }, [loginState]);

  const {theme, isDark, toggleTheme} = useContext(ThemeContext);

  const TooltipComponent = () => {
    const {
      isFirstStep,
      isLastStep,
      goToNext,
      goToNth,
      goToPrev,
      stop,
      currentStep,
      currentStepNumber,
      totalStepsNumber,
    } = useCopilot();
    return (
      <View
        style={[
          styles.tooltip,
          {backgroundColor: theme.dark ? '#1E392B' : '#ffffff'},
        ]}>
        <View style={{gap: 12}}>
          <Text style={[styles.tooltipTitle, {color: theme.colors.text}]}>
            {currentStep?.text.split('|')[0]}
          </Text>
          <Text style={[styles.tooltipText, {color: theme.colors.text}]}>
            {currentStep?.text.split('|')[1]}
          </Text>
        </View>
        {currentStep?.name === 'chooseYourDisplayMode' ? (
          <View>
            <ThemeSwitch
              options={[
                {
                  key: 'light',
                  label: 'Light mode',
                  icon: 'white-balance-sunny',
                },
                {key: 'dark', label: 'Dark mode', icon: 'weather-night'},
              ]}
              onToggle={value => toggleTheme(value)}
              selectedOption={theme.dark ? 1 : 0}
            />
          </View>
        ) : null}
        {/* <Pagination currentStep={currentStep} /> */}
        <View style={styles.buttons}>
          <View style={styles.container}>
            {Array.from({length: totalStepsNumber}).map((_, index) => {
              const isFilled = index + 1 == currentStepNumber;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isFilled ? {backgroundColor: 'black'} : styles.dotEmpty,
                  ]}
                />
              );
            })}
          </View>
          {!isLastStep ? (
            <Button
              mode="contained"
              textColor={theme.colors.text}
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
              outlined
              onPress={() => goToNext()}>
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              textColor={theme.colors.text}
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
              outlined
              onPress={() => stop()}>
              Done
            </Button>
          )}
        </View>
      </View>
    );
  };

  const customSvgPath = args => {
    if (
      args.step?.name === 'openActionButton' ||
      args.step?.name === 'openNotificationCenter'
    ) {
      const padding = 5;
      const baseRadius = Math.min(args.size.x._value, args.size.y._value) / 2;
      const radius = baseRadius + padding;

      const cx = args.position.x._value + args.size.x._value / 2;
      const cy = args.position.y._value + args.size.y._value / 2;

      return `M0,0H${args.canvasSize.x}V${args.canvasSize.y}H0V0Z
          M${cx - radius},${cy}
          A${radius} ${radius} 0 1 0 ${cx + radius},${cy}
          A${radius} ${radius} 0 1 0 ${cx - radius},${cy}`;
    } else if (args.step?.name === 'chooseYourDisplayMode') {
      const padding = 0;

      const x = args.position.x._value - padding;
      const y = args.position.y._value - padding;
      const width = args.size.x._value + 2 * padding;
      const height = args.size.y._value + 2 * padding;

      return `M0,0H${args.canvasSize.x}V${args.canvasSize.y}H0V0Z
          M${x},${y}H${x + width}V${y + height}H${x}V${y}Z`;
    } else {
      const padding = 5;

      const x = args.position.x._value - padding;
      const y = args.position.y._value - padding;
      const width = args.size.x._value + 2 * padding;
      const height = args.size.y._value + 2 * padding;

      return `M0,0H${args.canvasSize.x}V${args.canvasSize.y}H0V0Z
          M${x},${y}H${x + width}V${y + height}H${x}V${y}Z`;
    }
  };
  return (
    <Provider theme={theme}>
      <StatusBar
        translucent
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.dark ? '#000000' : '#ffffff'} // for Android
      />
      <CopilotProvider
        tooltipStyle={{backgroundColor: theme.dark ? '#1E392B' : '#ffffff'}}
        tooltipComponent={TooltipComponent}
        stepNumberComponent={() => null}
        animated
        svgMaskPath={customSvgPath}
        style={{height: '100%'}}
        overlay="svg">
        <BottomSheetModalProvider>
          <AuthContext.Provider value={authContext}>
            <NavigationContainer
              style={{backgroundColor: theme.colors.background}}>
              {loginState.userToken !== null ? (
                <Stack.Navigator>
                  <Stack.Screen
                    name="Root"
                    component={MainTabs}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="WebViewScreen"
                    component={WebViewScreen}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="AccountPublicKeys"
                    component={AccountPublicKeys}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="AccountScripts"
                    component={AccountScripts}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="EditAccountScript"
                    component={EditAccountScript}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Webdock AI Assistant"
                    component={WebViewWebdockAI}
                    options={{}}
                  />
                  <Stack.Screen
                    name="ServerConsole"
                    component={ServerConsole}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Activity"
                    component={ServerActivity}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Events"
                    component={ServerEvents}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Snapshots"
                    component={ServerSnapshots}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Shell Users"
                    component={ServerShellUsers}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Scripts"
                    component={ServerScripts}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="NotificationCenter"
                    component={NotificationCenter}
                    options={{
                      presentation: 'transparentModal',
                      animation: 'fade',
                      headerShown: false,
                    }}
                  />
                </Stack.Navigator>
              ) : (
                <RootStack />
              )}
              <OfflineNotice style={{zIndex: 200000}} />
              <Toast style={{zIndex: 200000}} />
            </NavigationContainer>
            <OfflineNotice style={{zIndex: 200000}} />
            <Toast style={{zIndex: 200000}} />
          </AuthContext.Provider>
        </BottomSheetModalProvider>
      </CopilotProvider>
    </Provider>
  );
}

const DOT_SIZE = 10;

const styles = StyleSheet.create({
  tooltip: {
    padding: 0,
    paddingBottom: 20,
    borderRadius: 4,
    gap: 20,
  },
  tooltipTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    fontSize: 16,
  },
  tooltipText: {
    fontFamily: 'Poppins-Light',
    fontWeight: '300',
    fontSize: 14,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginHorizontal: 4,
  },
  dotEmpty: {
    backgroundColor: '#ccc',
  },
  dotFilled: {
    backgroundColor: '#673ab7',
  },
});
