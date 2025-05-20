import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {NavigationContainer} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Provider} from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
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
  resetSession,
} from 'react-native-crisp-chat-sdk';
export default function WebdockApp() {
  //const [isLoading, setIsLoading] = React.useState(true);
  //const [userToken, setUserToken] = React.useState(null);
  configure('6752e856bad04e1f6cc59556');

  // this should be user ID that way app will load previous user chats
  setUserTokenId('abcd12345');

  // Set user's info
  setUserEmail('test@test.com');
  setUserNickname('John Smith');
  setUserPhone('+614430231224');
  const initialLoginState = {
    isLoading: true,
    userToken: null,
  };
  const [netModalIsVisible, setNetModalIsVisible] = useState();

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
      SplashScreen.hide();
    }
  }, [loginState]);

  const {theme} = useContext(ThemeContext);

  return (
    <Provider theme={theme}>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <BottomSheetModalProvider>
            {loginState.userToken !== null ? <MainTabs /> : <RootStack />}
          </BottomSheetModalProvider>
          <OfflineNotice style={{zIndex: 200000}} />
          <Toast ref={ref => Toast.setRef(ref)} style={{zIndex: 200000}} />
        </NavigationContainer>
        <CrispChat />
        <OfflineNotice style={{zIndex: 200000}} />
        <Toast ref={ref => Toast.setRef(ref)} style={{zIndex: 200000}} />
      </AuthContext.Provider>
    </Provider>
  );
}
