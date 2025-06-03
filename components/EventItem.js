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
import NormalEventIcon from '../assets/normal-event.svg';
const EventItem = ({
  action,
  actionData,
  eventType,
  message,
  startTime,
  status,
  id,
}) => {
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
          <View
            style={{
              width: 42,
              height: 42,
              backgroundColor: '#F3F3F3',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <NormalEventIcon color="#B9B9B9" />
          </View>
          <View style={{flex: 1, paddingLeft: 12}}>
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
                {action}
              </Text>
            </View>
            <Text
              style={{
                height: 18,
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                fontWeight: '300',
                flexWrap: 'wrap',
                color: '#8F8F8F',
              }}>
              {actionData}
            </Text>
            <Text
              style={{
                height: 18,
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                fontWeight: '300',
                color: '#8F8F8F',
              }}>
              {startTime}
            </Text>
          </View>
          <ArrowIcon
            width={15}
            height={15}
            color={theme.colors.primaryText}
            style={{flex: 1}}
          />
        </View>
      </View>
    </>
  );
};
export default EventItem;
