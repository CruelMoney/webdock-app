import AsyncStorage from '@react-native-community/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Image, Switch, Text, View} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import MenuIcon from '../assets/menu-icon.svg';
import PubicKeyIcon from '../assets/public-key-icon.svg';
import ScriptsIcon from '../assets/scripts-icon.svg';
import {getAccountInformations} from '../service/accountInformations';
import {useTheme} from 'react-native-paper';
import Spacer from '../components/Spacer';
import ThemeSwitch from '../components/ThemeSwitch';
import {ThemeContext} from '../components/ThemeContext';

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

  const theme = useTheme();
  const tabs = [
    // {"label":"General","icon":<UserIcon width={30} height={30} color="#00a1a1" />,"navigate":"AccountInfo"},
    {
      label: 'Edit profile',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'Edit profile',
    },
    {
      label: 'Team',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      icon: (
        <ScriptsIcon width={12} height={12} color={theme.colors.background} />
      ),
      navigate: 'Team',
    },
    {
      label: 'Notification settings',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'Notification settings',
    },
    {
      label: 'Public keys',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'PublicKeys',
    },
    {
      label: 'Scripts',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      icon: (
        <ScriptsIcon width={12} height={12} color={theme.colors.background} />
      ),
      navigate: 'Scripts',
    },
    {
      label: 'Legal documents',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      icon: (
        <ScriptsIcon width={12} height={12} color={theme.colors.background} />
      ),
      navigate: 'Legal documents',
    },
  ];
  const {isDark, toggleTheme} = useContext(ThemeContext);

  return account ? (
    <View
      width="100%"
      height="100%"
      style={{
        backgroundColor: theme.colors.background,
        padding: 20,
      }}>
      <View
        style={{
          padding: 20,
          backgroundColor: theme.colors.surface,
          borderRadius: 4,
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
              style={{borderRadius: 58 / 2, width: 58, height: 58}}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginStart: 20,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                textAlignVertical: 'center',
                fontFamily: 'Poppins-Medium',
                fontSize: 18,
                lineHeight: 18 * 1.2,
                fontWeight: '500',
                color: theme.colors.text,
              }}>
              {account.userName}
            </Text>
            <Spacer size={5} />
            <Text
              style={{
                fontFamily: 'Poppins',
                textAlignVertical: 'center',
                fontSize: 12,
                lineHeight: 12 * 1.2,
                fontWeight: '500',
                color: '#7c7c7c',
              }}>
              Credit Balance:
              <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  fontWeight: '400',
                  lineHeight: 12 * 1.2,
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
      {/* <FlatList
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
      /> */}
      <Spacer size={24} />
      <View>
        <ThemeSwitch
          options={[
            {label: 'Light mode', icon: 'white-balance-sunny'},
            {label: 'Dark mode', icon: 'weather-night'},
          ]}
          onToggle={value => toggleTheme()}
        />
      </View>
      <Spacer size={24} />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {tabs.map(item => (
          <View
            key={item.label}
            style={{
              width: '48%',
              marginBottom: 10,
              borderRightWidth: 4,
              borderRightColor: theme.colors.primary,
              backgroundColor: '#022213',
              borderRadius: 10,
            }}>
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.navigate)}>
              <View style={{height: 132, padding: 12}}>
                <View style={{display: 'flex'}}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {item.icon}
                  </View>
                  <Spacer size={8} />
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontWeight: '600',
                      fontSize: 14,
                      lineHeight: 14 * 1.2,
                      color: 'white',
                    }}>
                    {item.label}
                  </Text>
                  <Spacer size={8} />
                  <Text
                    style={{
                      fontFamily: 'Poppins-Light',
                      fontWeight: '300',
                      fontSize: 12,
                      lineHeight: 12 * 1.2,
                      color: 'white',
                    }}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#008570" />
    </View>
  );
}
