import {Image, Text, View} from 'react-native';
import {Button, Icon, useTheme} from 'react-native-paper';
import {Pressable} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import ConnectIcon from '../assets/connect-icon.svg';
import RestoreIcon from '../assets/restore-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import ReactNativeModal from 'react-native-modal';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';
const SnapshotItem = ({item}) => {
  const theme = useTheme();
  return (
    <View style={{backgroundColor: theme.colors.surface}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
        }}>
        {/* Left: Icon */}
        <View
          style={{
            width: 42,
            height: 42,
            backgroundColor: '#F3F3F3',
            borderRadius: 4,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Icon source="folder-open-outline" size={24} color="#B9B9B9" />
        </View>

        {/* Middle: Text (expandable, aligned left) */}
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              color: theme.colors.text,
              includeFontPadding: false,
            }}>
            {item.type === 'user' ? item.name : item.date}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: '#8F8F8F',
              includeFontPadding: false,
            }}>
            {item.serverSlug} snapshot
          </Text>
        </View>
      </View>
    </View>
  );
};
export default SnapshotItem;
