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
import {StyleSheet, Text, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AccountPublicKeys from './screens/AccountPublicKeys';
import WebViewScreen from './screens/WebViewScreen';
import AccountScripts from './screens/AccountScripts';
import EditAccountScript from './screens/EditAccountScript';
export default function WebdockApp() {
  //const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  configure('a3c561be-1f43-4c0e-aa0f-6c88579e55a9');

  // this should be user ID that way app will load previous user chats
  setTokenId('abcd12345');

  // Set user's info
  setUserEmail('test@test.com');
  setUserNickname('John Smith');
  setUserPhone('+614430231224');
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

  const {theme} = useContext(ThemeContext);
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
      <View style={styles.tooltip}>
        <View style={{gap: 12}}>
          <Text style={styles.tooltipTitle}>
            {currentStep?.text.split('|')[0]}
          </Text>
          <Text style={styles.tooltipText}>
            {currentStep?.text.split('|')[1]}
          </Text>
        </View>
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
                    isFilled
                      ? {backgroundColor: theme.colors.surface}
                      : styles.dotEmpty,
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
  return (
    <Provider theme={theme}>
      <CopilotProvider
        tooltipComponent={TooltipComponent}
        stepNumberComponent={() => null}
        animated
        style={{height: '100%'}}
        overlay="view">
        <BottomSheetModalProvider>
          <AuthContext.Provider value={authContext}>
            <NavigationContainer>
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
