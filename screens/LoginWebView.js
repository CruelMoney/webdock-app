import React, {Component, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import {AuthContext} from '../components/context';
import {getPing} from '../service/ping';

// ...
export function LoginWebView() {
  const [deviceName, setDeviceName] = useState();
  const {signIn} = React.useContext(AuthContext);
  const [token, setToken] = useState('');
  const loginHandle = usertoken => {
    getPing(usertoken).then(data => {
      console.log(data);
      if (data.webdock === 'rocks') {
        console.log('logged in');
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
