import React, {
  useState,
  useEffect,
  PureComponent,
  useRef,
  useCallback,
} from 'react';
import {Image, Text, View} from 'react-native';
import Spacer from './Spacer';
import {
  ActivityIndicator,
  Icon,
  ProgressBar,
  useTheme,
} from 'react-native-paper';
import ArrowIcon from '../assets/arrow-icon.svg';
import NormalEventIcon from '../assets/normal-event.svg';
import DoneEventIcon from '../assets/done-event.svg';
import ErrorEventIcon from '../assets/error-event.svg';
import {Pressable} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetModal} from '@gorhom/bottom-sheet';
const EventItem = ({
  action,
  actionData,
  eventType,
  message,
  startTime,
  status,
  id,
  onDetailsPress,
}) => {
  const theme = useTheme();
  const renderEventStatusIcon = status => {
    if (status == 'error') {
      return <ErrorEventIcon />;
    } else if (status == 'finished' && message != '') {
      return <NormalEventIcon />;
    } else if (status == 'finished') {
      return <DoneEventIcon />;
    } else if (status == 'waiting') {
      return (
        <ActivityIndicator animating={true} size={10} color={Colors.blue400} />
      );
    } else if (status == 'working') {
      return (
        <ActivityIndicator animating={true} size={10} color={Colors.blue400} />
      );
    }
  };
  return (
    <>
      <View style={{backgroundColor: theme.colors.surface}}>
        {status == 'waiting' || status == 'working' ? (
          <View
            style={{
              display: 'flex',
              padding: 14,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
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
            <Text
              style={{
                height: 18,
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                fontWeight: '300',
                flexWrap: 'wrap',
                color: theme.colors.text,
                marginBottom: 8,
              }}>
              {actionData}
            </Text>
            <View style={{width: '100%'}}>
              <ProgressBar
                indeterminate
                color={theme.colors.primary}
                style={{
                  height: 5,
                  backgroundColor: '#bcbcbc',
                }}
              />
            </View>
          </View>
        ) : (
          <Pressable
            disabled={
              !(status === 'error' || (status === 'finished' && !!message))
            }
            onPress={onDetailsPress}
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
                backgroundColor: theme.dark ? '#E6F2E61A' : '#F3F3F3',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {renderEventStatusIcon(status)}
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
            {(status === 'error' || (status === 'finished' && !!message)) && (
              <ArrowIcon
                width={15}
                height={15}
                color={theme.colors.primaryText}
                style={{marginLeft: 8}}
              />
            )}
          </Pressable>
        )}
      </View>
    </>
  );
};
export default EventItem;
