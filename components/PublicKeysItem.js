import {Image, Text, View} from 'react-native';
import {Button, Icon, useTheme} from 'react-native-paper';
import {Pressable, TouchableOpacity} from 'react-native-gesture-handler';
import DeleteIcon from '../assets/delete-icon.svg';
import ReactNativeModal from 'react-native-modal';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';
const PublicKeysItem = ({item, onRequestDelete}) => {
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
          <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
            <View
              style={{
                width: 42,
                height: 42,
                backgroundColor: '#F3F3F3',
                borderRadius: 4,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon source="key" size={24} color="#B9B9B9" />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 16,
                  includeFontPadding: false,
                  color: theme.colors.text,
                }}>
                {item.name}
              </Text>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 12,
                    color: '#8F8F8F',
                    includeFontPadding: false,
                  }}>
                  {item.created}
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => {
              onRequestDelete(item);
            }}>
            <DeleteIcon color={theme.dark ? '#FFE6E61A' : '#FFE6E6'} />
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default PublicKeysItem;
