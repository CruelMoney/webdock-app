import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import MenuIcon from '../assets/menu-icon.svg';
import PubicKeyIcon from '../assets/public-key-icon.svg';
import ScriptsIcon from '../assets/scripts-icon.svg';
import {getAccountInformations} from '../service/accountInformations';

export default function Account({navigation}) {
  const [account, setAccount] = useState();
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAccountInformations(userToken).then(data => {
          setAccount(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);

  const tabs = [
    // {"label":"General","icon":<UserIcon width={30} height={30} color="#00a1a1" />,"navigate":"AccountInfo"},
    {
      label: 'Public Keys',
      icon: <PubicKeyIcon width={30} height={30} color="#00a1a1" />,
      navigate: 'PublicKeys',
    },
    {
      label: 'Scripts',
      icon: <ScriptsIcon width={30} height={30} color="#00a1a1" />,
      navigate: 'Scripts',
    },
  ];
  return account ? (
    <View
      width="100%"
      height="100%"
      style={{backgroundColor: '#F4F8F8', padding: '8%'}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity onPress={navigation.openDrawer}>
          <MenuIcon height={45} width={28} />
        </TouchableOpacity>
        <Text
          style={{
            color: '#00A1A1',
            fontFamily: 'Raleway-Medium',
            fontSize: 20,
          }}>
          Account
        </Text>
        <View style={{width: 50}}></View>
      </View>
      <View
        style={{
          marginTop: 20,
          padding: 15,
          backgroundColor: 'white',
          borderRadius: 10,
        }}>
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <View>
            <Image
              source={{
                uri: !account.userAvatar
                  ? 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                  : account.userAvatar.startsWith('https://')
                  ? account.userAvatar
                  : 'https:' + account.userAvatar,
              }}
              style={{borderRadius: 70 / 2, width: 70, height: 70}}
            />
          </View>
          <View style={{marginStart: 20, height: '100%'}}>
            <Text
              style={{flex: 1, fontFamily: 'Raleway-Regular', fontSize: 18}}>
              {account.userName}
            </Text>
            <Text
              style={{
                flex: 1,
                fontFamily: 'Raleway-Light',
                fontSize: 12,
                color: '#7c7c7c',
              }}>
              Credit Balance:
              <Text
                style={{
                  fontFamily: 'Raleway-Light',
                  fontSize: 14,
                  color: '#4C9F5A',
                }}>
                {' '}
                {account.accountBalanceRaw / 100}{' '}
                {account.accountBalanceCurrency}
              </Text>
            </Text>
          </View>
        </View>
      </View>
      <Text
        style={{
          marginTop: 25,
          marginBottom: 5,
          fontFamily: 'Raleway-Regular',
          fontSize: 18,
          color: '#000000',
        }}>
        Account info
      </Text>
      <FlatList
        data={tabs}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => navigation.navigate(item.navigate)}>
            <View
              style={{
                backgroundColor: 'white',
                marginBottom: 10,
                borderRadius: 10,
              }}>
              <View
                style={{
                  display: 'flex',
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {item.icon}
                <Text
                  style={{
                    fontFamily: 'Raleway-Regular',
                    fontSize: 16,
                    marginStart: 15,
                  }}>
                  {item.label}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#008570" />
    </View>
  );
}
