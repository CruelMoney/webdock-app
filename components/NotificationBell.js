import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NotificationIcon from '../assets/notification-bell.svg';
import {useTheme} from 'react-native-paper';

export default function NotificationBell({hasNew}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  useEffect(() => {
    if (hasNew) {
      triggerShake();
    }
  }, [hasNew]);
  // Trigger animation every 5 seconds if there's a new notification
  //   useEffect(() => {
  //     if (hasNew) {
  //       triggerShake(); // optional immediate shake
  //       //   intervalRef.current = setInterval(triggerShake, 5000);
  //     } else {
  //       // stop any ongoing loop
  //       //   clearInterval(intervalRef.current);
  //       //   shakeAnim.setValue(0);
  //     }

  //     return () => clearInterval(intervalRef.current); // cleanup on unmount
  //   }, [hasNew]);

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

  // Interpolate the value to rotate in degrees
  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const theme = useTheme();

  return (
    <TouchableOpacity onPress={() => {}}>
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
    </TouchableOpacity>
  );
}
