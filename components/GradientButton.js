import React from 'react';
import {ActivityIndicator, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';

export default function GradientButton({submitting, text}) {
  const theme = useTheme();
  return (
    <LinearGradient
      locations={[0.29, 0.8]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={[theme.colors.primary, theme.colors.primary]}
      style={{borderRadius: 5, padding: 10}}>
      {!submitting ? (
        <Text
          style={{
            includeFontPadding: false,
            fontFamily: 'Poppins-Bold',
            fontSize: 14,
            color: theme.colors.text,
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
