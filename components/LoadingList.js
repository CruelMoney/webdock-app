import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

export default function LoadingList() {
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <ActivityIndicator size="medium" color="#00a1a1" />
    </View>
  );
}
