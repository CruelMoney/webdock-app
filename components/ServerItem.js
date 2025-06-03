import React, {
  useState,
  useEffect,
  PureComponent,
  useRef,
  useCallback,
} from 'react';
import {Image, Text, View} from 'react-native';
import Spacer from './Spacer';
import {useTheme} from 'react-native-paper';
import ArrowIcon from '../assets/arrow-icon.svg';

const ServerItem = ({title, alias, dc, profile, ipv4, status}) => {
  const theme = useTheme();

  return (
    <>
      <View style={{backgroundColor: theme.colors.surface}}>
        <View
          style={{
            display: 'flex',
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
            }}
            style={{borderRadius: 4, width: 42, height: 42}}
          />
          <View style={{flexGrow: 1, paddingLeft: 12, height: 42}}>
            <View
              style={{
                height: 24,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 16,
                  fontWeight: '500',
                  color: theme.colors.text,
                }}>
                {title}
              </Text>
            </View>
            <Text
              style={{
                height: 18,
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                fontWeight: '300',
                color: '#8F8F8F',
              }}>
              {status.charAt(0).toUpperCase() + status.slice(1)} · {profile} ·{' '}
              {ipv4}
            </Text>
          </View>
          <ArrowIcon width={15} height={15} color={theme.colors.primaryText} />
        </View>
      </View>
    </>
  );
};
export default ServerItem;
