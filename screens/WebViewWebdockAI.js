import React, {useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Alert,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {WebView} from 'react-native-webview';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {IconButton, useTheme} from 'react-native-paper';

export default function WebViewWebdockAI({navigation}) {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDeviceName);
  }, []);

  const hideSpinner = () => setLoading(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Webdock AI Chat</title>
        <script
          src="https://files.userlink.ai/public/embed.min.js"
          charset="utf-8"
          data-cid="6752e856bad04e1f6cc59556"
          async
          domain="webdock.io">
        </script>
        <script
          src="https://webdock.io/static/common/js/chatbots-logic.js?v=1.1"
          async>
        </script>
      </head>
      <body>
        <div id="bai-cb-container"></div>
      </body>
    </html>
  `;

  const injectedJavaScriptBeforeContentLoaded = `

`;
  const injectedJavaScript = `

  `;
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef(null);
  const snapPoints = ['93%'];
  const handleChange = index => {
    if (index === -1) {
      navigation.goBack();
    }
  };
  useEffect(() => {
    let attempts = 0;

    const trySnap = () => {
      if (bottomSheetRef.current) {
        try {
          bottomSheetRef.current.snapToIndex(0);
        } catch (e) {
          Alert.alert('test', e);
        }
      }

      // If it hasn't opened yet, try again
      if (attempts < 5) {
        attempts++;
        setTimeout(trySnap, 100); // Retry every 100ms
      }
    };

    const task = InteractionManager.runAfterInteractions(() => {
      trySnap(); // try after interactions & layout
    });

    return () => {
      task.cancel();
    };
  }, []);
  const theme = useTheme();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        enableDynamicSizing={false} // ✅ IMPORTANT
        detached={false} // avoid it floating freely
        onChange={handleChange}
        handleComponent={() => null}
        style={{
          backgroundColor: 'transparent',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginBottom: insets.bottom + 20,
        }}
        backgroundStyle={{
          backgroundColor: 'transparent',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 0,
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
        <BottomSheetView
          style={{
            flex: 1,
            flexDirection: 'column',
            padding: 0,
            margin: 0,
            gap: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              backgroundColor: theme.colors.background,
            }}>
            <IconButton
              icon="close"
              size={30}
              color={theme.colors.text}
              onPress={() => navigation.goBack()}
              style={{
                padding: 0,
                margin: 0,
              }}
            />
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 22,
                textAlign: 'center',
                color: theme.colors.text,
              }}>
              AI Assistant
            </Text>
            <View style={{width: 30, height: 30}}></View>
          </View>
          <WebView
            originWhitelist={['*']}
            userAgent={'Webdock Mobile App WebView v1.0'}
            source={{
              uri: 'https://webdock.io/static/aichat/',
              headers: {'X-Device-Name': deviceName},
            }}
            javaScriptEnabled={true}
            injectedJavaScriptBeforeContentLoaded={
              injectedJavaScriptBeforeContentLoaded
            }
            scalesPageToFit
            injectedJavaScript={injectedJavaScript}
            cacheEnabled={false}
            incognito={true}
            onLoadEnd={hideSpinner}
            onMessage={event => {
              console.log('[WebView]', event.nativeEvent.data);
            }}
            onError={e => console.warn('[WebView Error]', e.nativeEvent)}
            onHttpError={e =>
              console.warn('[WebView HTTP Error]', e.nativeEvent)
            }
            style={{flex: 1, marginBottom: insets.bottom}}
          />
          {loading && (
            <ActivityIndicator
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{translateX: -25}, {translateY: -25}],
              }}
              size="large"
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
