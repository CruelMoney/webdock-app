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
import {getServerIcon} from '../service/servers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

const ServerItem = ({title, alias, dc, profile, ipv4, status, slug}) => {
  const theme = useTheme();
  const renderStatusIcon = icon => {
    if (icon == 'running') {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'stopped') {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#E15241',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'waiting') {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'working') {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (
      icon == 'provisioning' ||
      icon == 'rebooting' ||
      icon == 'starting' ||
      icon == 'stopping' ||
      icon == 'reinstalling'
    ) {
      return (
        <>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    }
    return null;
  };
  const [icon, setIcon] = useState();
  useEffect(() => {
    getServerIcon(slug).then(data => {
      console.log(fixUrl(data.icon));
      setIcon(fixUrl(data.icon));
    });
  }, []);
  function fixUrl(url) {
    let unescaped = url.replace(/\\\//g, '/');
    if (unescaped.startsWith('//')) {
      return 'https:' + unescaped;
    }
    if (unescaped.startsWith('http://') || unescaped.startsWith('https://')) {
      return unescaped;
    }
    return unescaped;
  }

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
          <FastImage
            source={{
              uri: icon,
              priority: FastImage.priority.normal,
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
              {renderStatusIcon(status)} · {ipv4}
            </Text>
          </View>
          <ArrowIcon width={15} height={15} color={theme.colors.primaryText} />
        </View>
      </View>
    </>
  );
};
export default ServerItem;
