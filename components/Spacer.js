import React from 'react';
import {View} from 'react-native';
const Spacer = ({size = 10, horizontal = false}) => {
  return (
    <View
      style={{
        width: horizontal ? size : 0,
        height: horizontal ? 0 : size,
      }}
    />
  );
};
export default Spacer;
