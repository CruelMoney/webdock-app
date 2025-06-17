import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {WebView} from 'react-native-webview';
import DeviceInfo from 'react-native-device-info';

export function WebViewWebdockAI() {
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

  return (
    <View style={{flex: 1, backgroundColor: '#F4F8F8'}}>
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
        injectedJavaScript={injectedJavaScript}
        cacheEnabled={false}
        incognito={true}
        onLoadEnd={hideSpinner}
        onMessage={event => {
          console.log('[WebView]', event.nativeEvent.data);
        }}
        onError={e => console.warn('[WebView Error]', e.nativeEvent)}
        onHttpError={e => console.warn('[WebView HTTP Error]', e.nativeEvent)}
        style={{flex: 1}}
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
    </View>
  );
}
