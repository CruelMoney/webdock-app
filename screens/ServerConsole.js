import React, {Component, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {WebView} from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';
import {AuthContext} from '../components/context';
import {getPing} from '../service/ping';
import {TouchableOpacity} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';

// ...
export function ServerConsole({navigation, route}) {
  const [deviceName, setDeviceName] = useState();
  const {signIn} = React.useContext(AuthContext);
  const deviceWidthPx = Dimensions.get('window').width;
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
  const meta = document.createElement('meta'); 
  meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); 
  meta.setAttribute('name', 'viewport'); 
  document.getElementsByTagName('head')[0].appendChild(meta); 
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
      <View width="100%" height="100%" style={{backgroundColor: '#F4F8F8'}}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: '2%',
            padding: '2%',
          }}>
          <TouchableOpacity onPress={navigation.goBack}>
            <BackIcon height={45} width={50} />
          </TouchableOpacity>
          <Text
            style={{
              color: '#00A1A1',
              fontFamily: 'Raleway-Medium',
              fontSize: 20,
              textAlign: 'center',
            }}>
            Console
          </Text>
          <View style={{width: 50}}></View>
        </View>
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
          style={{resizeMode: 'cover'}}
          scalesPageToFit={false}
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
      </View>
      {loading && (
        <ActivityIndicator style={{position: 'absolute'}} size="large" />
      )}
    </>
  );
}
