import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View, TouchableOpacity} from 'react-native';
import NotificationIcon from '../assets/notification-bell.svg';
import {useTheme} from 'react-native-paper';
import {useEventStatus} from './CallbackStatusWatcher';
import {onBellRing} from '../service/storageEvents';

export default function NotificationBell({hasNew}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = onBellRing(() => {
      triggerShake();
    });
    return unsubscribe;
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    const oneShake = [
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ];
    Animated.sequence([...oneShake, ...oneShake]).start();
  };

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <View>
      <View
        style={{
          width: 28,
          height: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Animated.View style={{transform: [{rotateZ: rotate}]}}>
          <NotificationIcon height={28} width={28} color={theme.colors.text} />
        </Animated.View>
      </View>
    </View>
  );
}
