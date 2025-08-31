import React, {useEffect, useState} from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import {ScrollView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
            uri: `https://webdock.io/en/app_data/appLoginRedirectUser${separator}app_token=${encodeURIComponent(
              token,
            )}&destination=${destination}&user_id=${
              accountInfo.userId
            }&secret=bf34eaa48c2643bb9bec16e8f46d88d8`,
          });
        } else {
          if (!isActive) return;

          setSource({
            uri,
            headers: {
              Authorization: `Bearer ${token}`,
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
  return (
    <BottomSheetWrapper
      title=""
      onClose={() => navigation.goBack()}
      style={styles.container}>
      <View style={{flex: 1}}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="gray" />
            <Text style={{textAlign: 'center'}}>Loading...</Text>
            <Text style={{textAlign: 'center'}}>
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
            source={source}
            style={[
              StyleSheet.absoluteFill,
              {
                paddingHorizontal: 20,
                gap: 24,
                marginBottom: insets.bottom,
              },
            ]}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            nestedScrollEnabled={true}
            pullToRefreshEnabled={enablePullToRefresh}
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
