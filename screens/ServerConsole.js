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
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ...
export function ServerConsole({navigation, route}) {
  const [deviceName, setDeviceName] = useState();
  const {signIn} = React.useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const deviceWidthPx = Dimensions.get('window').width;
  const [token, setToken] = useState('');
  const desiredWidth = 600;
  // Calculate scale based on actual device width
  const scale = deviceWidthPx / desiredWidth;
  console.log(scale);
  console.log(desiredWidth);
  // Update viewport content dynamically
  const runFirst = `     
    window.isNativeApp = true;
    true; // note: this is required, or you'll sometimes get silent failures
    `;
  const injectedJavaScript = `
//mobile viewport hack
(function(){

  function apply_viewport(){
    if( /Webdock Mobile App WebView v1.0|Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)   ) {

      var ww = window.screen.width;
      var mw = 600; // min width of site
      var ratio =  ww / mw; //calculate ratio
      var viewport_meta_tag = document.getElementById('viewport');
      if( ww < mw){ //smaller than minimum size
        viewport_meta_tag.setAttribute('content', 'initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable=no, width=' + mw);
      }
      else { //regular size
        viewport_meta_tag.setAttribute('content', 'initial-scale=1.0, maximum-scale=1, minimum-scale=1.0, user-scalable=yes, width=' + ww);
      }
    }
  }

  //ok, i need to update viewport scale if screen dimentions changed
  window.addEventListener('resize', function(){
    apply_viewport();
  });

  apply_viewport();

}());
`;
  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      setDeviceName(deviceName);
    });
  }, [navigation]);

  const [loading, setLoading] = useState(true);
  const hideSpinner = () => {
    setLoading(false);
  };
  const winH = Dimensions.get('window').height;

  function getSheetHeight(firstSnap) {
    if (typeof firstSnap === 'number') return firstSnap;
    if (typeof firstSnap === 'string' && firstSnap.endsWith('%')) {
      const pct = parseFloat(firstSnap) || 0;
      return winH * (pct / 100);
    }
    return 0; // fallback
  }

  const sheetH = getSheetHeight('93%'); // or your current snap point
  const gap = Math.max(winH - sheetH, 0); // tweak to your BottomSheetWrapper’s footer/handle height
  const bottomOffset = Math.max(insets.bottom, gap);
  return (
    <BottomSheetWrapper
      title={'WebSSH: ' + route.params.slug}
      onClose={() => navigation.goBack()}>
      <View width="100%" height="100%" style={{backgroundColor: '#F4F8F8'}}>
        <WebView
          userAgent={'Webdock Mobile App WebView v1.0'}
          source={{
            uri:
              ' https://app.webdock.io/en/webssh/' +
              route.params.slug +
              '/' +
              route.params.username +
              '?token=' +
              route.params.token +
              '&fromApp=true',
            headers: {
              'X-Device-Name': deviceName,
            },
          }}
          style={[
            StyleSheet.absoluteFill,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              // Lift the webview so the bottom sheet doesn't cover it
              bottom: bottomOffset,
            },
          ]}
          {...(Platform.OS === 'ios'
            ? {
                contentInset: {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: bottomOffset,
                },
                scrollIndicatorInsets: {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: bottomOffset,
                },
                contentInsetAdjustmentBehavior: 'never',
              }
            : {})}
          //style={{resizeMode: 'cover'}}
          //scalesPageToFit={false}
          javaScriptEnabled={true}
          injectedJavaScript={injectedJavaScript}
          incognito={true}
          cacheEnabled={false}
          onLoadEnd={hideSpinner}
          injectedJavaScriptBeforeContentLoaded={runFirst}
          onMessage={event => {}}
        />
      </View>
      {loading && (
        <ActivityIndicator style={{position: 'absolute'}} size="large" />
      )}
    </BottomSheetWrapper>
  );
}
