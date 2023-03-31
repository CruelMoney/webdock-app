import React from 'react';
import {ActivityIndicator, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function GradientButton({submitting, text}) {
  return (
    <LinearGradient
      locations={[0.29, 0.8]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={['#00A1A1', '#03A84E']}
      style={{borderRadius: 5}}>
      {!submitting ? (
        <Text
          style={{
            includeFontPadding: false,
            padding: 15,
            fontFamily: 'Raleway-Bold',
            fontSize: 18,
            color: 'white',
            textAlign: 'center',
          }}>
          {text}
        </Text>
      ) : (
        <ActivityIndicator size="large" color="#ffffff" style={{padding: 10}} />
      )}
    </LinearGradient>
  );
}
