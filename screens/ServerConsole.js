import React, {Component, useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import {AuthContext} from '../components/context';
import {getPing} from '../service/ping';

// ...
export function ServerConsole({navigation, route}) {
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
    console.log(route.params);
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
            ' https://webdock.io/en/webssh/' +
            route.params.slug +
            '/' +
            route.params.username +
            '?token=' +
            route.params.token,
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
          // const {data} = event.nativeEvent;
          // loginHandle(data);
        }}
      />
      {loading && (
        <ActivityIndicator style={{position: 'absolute'}} size="large" />
      )}
    </>
  );
}
