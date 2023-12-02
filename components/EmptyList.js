import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';

export default function EmptyList({text}) {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text style={{textAlign: 'center'}}>
        {
          'Sorry, nothing to see here yet. \nTry tapping the green + button below'
        }
      </Text>
    </View>
  );
}
