import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import {Platform} from 'react-native';

const API_ENDPOINT = 'https://app.webdock.io/en/app_data/savePushToken';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default async function requestUserPermission() {
  if (!Device.isDevice) {
    console.log('❌ Push notifications require a physical device');
    return;
  }

  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('❌ Push notification permission not granted');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const accountInfoRaw = await AsyncStorage.getItem('accountInfo');
    const accountInfo = JSON.parse(accountInfoRaw || '{}');
    const deviceType = Platform.OS;

    console.log('📡 Expo Push Token:', pushToken.data);

    const url = `${API_ENDPOINT}?user_id=${
      accountInfo.userId
    }&push_token=${encodeURIComponent(
      pushToken.data,
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
