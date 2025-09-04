import React, {Component, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import {AuthContext} from '../components/context';
import {getPing} from '../service/ping';
import {WebView} from 'react-native-webview';
import {getAccountInformations} from '../service/accountInformations';
import {
  setTokenId,
  setUserEmail,
  setUserNickname,
} from 'react-native-crisp-chat-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

// ...
export function LoginWebView() {
  const [deviceName, setDeviceName] = useState();
  const {signIn} = React.useContext(AuthContext);
  const [token, setToken] = useState('');
  const loginHandle = usertoken => {
    getPing(usertoken).then(data => {
      if (data.webdock === 'rocks') {
        console.log('logged in');
        getAccountInformations(usertoken).then(data => {
          AsyncStorage.setItem('accountInfo', JSON.stringify(data));
          const accountInfo = JSON.parse(JSON.stringify(data) || '{}');
          setTokenId(accountInfo.userId);
          setUserEmail(accountInfo.userEmail);
          setUserNickname(accountInfo.userName);
        });
        signIn(usertoken);
      } else {
        Alert.alert('Error', 'Something went wrong!');
      }
    });
  };
  const runFirst = `
      window.isNativeApp = true;
      true; // note: this is required, or you'll sometimes get silent failures
    `;
  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      setDeviceName(deviceName);
    });
  }, []);

  const [loading, setLoading] = useState(true);
  const hideSpinner = () => {
    setLoading(false);
  };
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  return (
    <>
      <WebView
        userAgent={'Webdock Mobile App WebView v1.0'}
        source={{
          uri:
            'https://webdock.io/en/login?fromApp=true&deviceName=' + deviceName,
          headers: {
            'X-Device-Name': deviceName,
          },
        }}
        style={{
          flex: 1,
          backgroundColor: "#E8EFE8",
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top,
        }}
        javaScriptEnabled={true}
        incognito={true}
        cacheEnabled={false}
        onLoadEnd={hideSpinner}
        injectedJavaScriptBeforeContentLoaded={runFirst}
        onMessage={event => {
          const {data} = event.nativeEvent;
          console.log(data);
          loginHandle(data);
        }}
      />
      {loading && (
        <View
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator style={{position: 'absolute'}} size="large" />
        </View>
      )}
    </>
  );
}
