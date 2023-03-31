import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

export default function EmptyList({text}) {
  return (
    <View
      style={{
        display: 'flex',
        justfiyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{textAlign: 'center'}}>{text}</Text>
    </View>
  );
}
