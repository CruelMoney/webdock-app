import React, {useEffect, useState} from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from 'react-native-paper';

export default function WebViewScreen({navigation}) {
  const route = useRoute();
  const {
    uri,
    token,
    tokenType = 'header', // default: send token in Authorization header
    enablePullToRefresh = false,
  } = route.params;
  const [source, setSource] = useState(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    let isActive = true; // Optional safety guard if unmounted before async completes

    const buildSource = async () => {
      try {
        if (tokenType === 'query') {
          const separator = uri.includes('?') ? '&' : '?';
          const accountInfoRaw = await AsyncStorage.getItem('accountInfo');
          const accountInfo = JSON.parse(accountInfoRaw || '{}');
          const destination = uri.replace('https://webdock.io', '');

          if (!isActive) return;

          setSource({
            uri: `https://app.webdock.io/en/app_data/appLoginRedirectUser${separator}app_token=${encodeURIComponent(
              token,
            )}&destination=${destination}&user_id=${
              accountInfo.userId
            }&secret=bf34eaa48c2643bb9bec16e8f46d88d8&fromApp=true`,
            headers: {
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 WebdockMobileApp/2.0',
            },
          });
        } else {
          if (!isActive) return;

          setSource({
            uri,
            headers: {
              Authorization: `Bearer ${token}`,
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1 WebdockMobileApp/2.0',
            },
          });
        }
      } catch (e) {
        console.error('Error building source:', e);
      }
    };

    buildSource();

    return () => {
      isActive = false; // Prevent setting state if unmounted
    };
  }, [tokenType, token, uri]);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    setError(nativeEvent.description);
    setLoading(false);
  };
  if (!source) return null;
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
      title=""
      onClose={() => navigation.goBack()}
      style={styles.container}>
      <View style={{flex: 1}}>
        {loading && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              zIndex: 10,
              backgroundColor: theme.colors.background,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
              gap: 5,
            }}>
            <ActivityIndicator size="large" color="gray" />
            <Text style={{textAlign: 'center', color: theme.colors.text}}>
              Loading...
            </Text>
            <Text style={{textAlign: 'center', color: theme.colors.text}}>
              Hang on, some links can take a few seconds to load
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.error}>
            <Text style={{color: 'red'}}>Error loading page: {error}</Text>
          </View>
        ) : (
          <WebView
            userAgent={'Webdock Mobile App WebView v2.0'}
            originWhitelist={['*']}
            source={source}
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
            allowFileAccessFromFileURLs
            allowingReadAccessToURL={
              Platform.OS === 'ios' ? undefined : undefined
            }
            javaScriptEnabled
            domStorageEnabled
            cacheEnabled={false}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            nestedScrollEnabled={true}
            pullToRefreshEnabled={enablePullToRefresh}
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
          />
        )}
      </View>
    </BottomSheetWrapper>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loader: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
