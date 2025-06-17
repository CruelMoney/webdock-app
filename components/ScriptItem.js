import {Image, Text, View} from 'react-native';
import {Button, Icon, useTheme} from 'react-native-paper';
import {Pressable, TouchableOpacity} from 'react-native-gesture-handler';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import ReactNativeModal from 'react-native-modal';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';
const ScriptItem = ({item, onRequestDelete, onRequestEdit}) => {
  const theme = useTheme();
  return (
    <View style={{backgroundColor: theme.colors.surface}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 14,
        }}>
        {/* Content Section */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: 12,
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
            <Icon source="code-tags" size={24} color="#B9B9B9" />
          </View>
          <View style={{flex: 1}}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 16,
                color: theme.colors.text,
                includeFontPadding: false,
              }}>
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                color: '#8F8F8F',
                includeFontPadding: false,
              }}>
              {item.filename}
            </Text>
          </View>
        </View>

        {/* Action Icons */}
        <View style={{flexDirection: 'row', gap: 8, marginLeft: 8}}>
          <Pressable onPress={() => onRequestEdit(item)}>
            <EditIcon color={theme.dark ? '#FFE6E61A' : '#FFE6E6'} />
          </Pressable>
          <Pressable onPress={() => onRequestDelete(item)}>
            <DeleteIcon color={theme.dark ? '#FFE6E61A' : '#FFE6E6'} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
export default ScriptItem;
