import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

const API_ENDPOINT = 'https://app.webdock.io/en/app_data/savePushToken';

export default async function requestUserPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Allow Notifications',
        message: 'This app would like to send you notifications.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('❌ POST_NOTIFICATIONS permission denied');
      return;
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log('❌ FCM permission not granted');
    return;
  }

  try {
    const userToken = await AsyncStorage.getItem('userToken');
    const accountInfoRaw = await AsyncStorage.getItem('accountInfo');
    const accountInfo = JSON.parse(accountInfoRaw || '{}');
    const fcmToken = await messaging().getToken();
    const deviceType = Platform.OS;

    console.log('📡 FCM Token:', fcmToken);

    const url = `${API_ENDPOINT}?user_id=${
      accountInfo.userId
    }&push_token=${encodeURIComponent(
      fcmToken,
    )}&device_type=${deviceType}&secret=bf34eaa48c2643bb9bec16e8f46d88d8`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Token sent successfully:', data);
    } else {
      console.error('❌ Server error:', data, url);
    }
  } catch (error) {
    console.error('❌ Failed to send token:', error.message);
  }
}
