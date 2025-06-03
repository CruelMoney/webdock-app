import React, {useState} from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';

export default function WebViewScreen() {
  const route = useRoute();
  const {
    uri,
    token,
    tokenType = 'header', // default: send token in Authorization header
    enablePullToRefresh = false,
  } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildSource = () => {
    if (tokenType === 'query') {
      const separator = uri.includes('?') ? '&' : '?';
      return {uri: `${uri}${separator}token=${encodeURIComponent(token)}`};
    }

    // Default: send token in header
    return {
      uri,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    setError(nativeEvent.description);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      )}

      {error ? (
        <View style={styles.error}>
          <Text style={{color: 'red'}}>Error loading page: {error}</Text>
        </View>
      ) : (
        <WebView
          userAgent={'Webdock Mobile App WebView v2.0'}
          source={buildSource()}
          style={StyleSheet.absoluteFill}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          pullToRefreshEnabled={enablePullToRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
