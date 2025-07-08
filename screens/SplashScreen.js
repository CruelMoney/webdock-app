import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import AnimatedSplash from './assets/animation.svg'; // SVGR-converted component

const SplashScreen = ({onFinish}) => {
  useEffect(() => {
    SplashScreen.hide(); // hide native splash

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedSplash width={200} height={200} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#022213',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
