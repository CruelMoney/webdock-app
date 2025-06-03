import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, Image, Switch, Text, View} from 'react-native';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import MenuIcon from '../assets/menu-icon.svg';
import PubicKeyIcon from '../assets/public-key-icon.svg';
import ScriptsIcon from '../assets/scripts-icon.svg';
import {getAccountInformations} from '../service/accountInformations';
import {Button, useTheme} from 'react-native-paper';
import Spacer from '../components/Spacer';
import ThemeSwitch from '../components/ThemeSwitch';
import {ThemeContext} from '../components/ThemeContext';
import CrispChat, {show} from 'react-native-crisp-chat-sdk';

export default function Chat({navigation}) {
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
      label: 'Docs',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description:
        'You should be able to find out easily how everything is put together and why',
      navigate: 'Edit profile',
    },
    {
      label: 'Webdock FAQ',
      description:
        'Click here to access our page outlining the most Frequently Asked Questions',
      icon: (
        <ScriptsIcon width={12} height={12} color={theme.colors.background} />
      ),
      navigate: 'Team',
    },
    {
      label: 'Contact us',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description: 'Be in touch with Webdock Support',
      navigate: 'Notification settings',
    },
    {
      label: 'App guide',
      icon: (
        <PubicKeyIcon width={12} height={12} color={theme.colors.background} />
      ),
      description: 'how to get started with our Mobile App for iOS and Android',
      navigate: 'PublicKeys',
    },
  ];

  return account ? (
    <View
      width="100%"
      height="100%"
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: 20,
      }}>
      <View>
        <View
          style={{
            height: 44,
            marginTop: 20,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            backgroundColor: theme.colors.accent,
            paddingHorizontal: 16,
            paddingVertical: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontWeight: '500',
              color: 'white',
              fontSize: 16,
              includeFontPadding: false,
            }}>
            Reach out to us
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.surface,
            paddingVertical: 15,
            paddingHorizontal: 12,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            <Image
              source={{
                uri: !account.userAvatar
                  ? 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                  : account.userAvatar.startsWith('https://')
                  ? account.userAvatar
                  : 'https:' + account.userAvatar,
              }}
              style={{width: 35, height: 35}}
            />
            <Spacer size={20} horizontal />
            <View style={{flex: 1, alignSelf: 'flex-start'}}>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 16,
                  lineHeight: 16 * 1.2,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                The Webdock AI Assistant is good for...
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Light',
                  fontSize: 12,
                  lineHeight: 12 * 1.2,
                  fontWeight: '300',
                  color: theme.colors.text,
                }}>
                {'\u2022'} Quick and accurate answers based on our
                documentation.{'\n'}
                {'\u2022'} Helping you choose the right Server Profile and
                Software.{'\n'}
                {'\u2022'} Helping with basic troubleshooting which doesn't
                require account access.
              </Text>
              <View style={{alignSelf: 'flex-start'}}>
                <Spacer size={12} />
                <Button
                  mode="contained"
                  textColor={theme.colors.text}
                  compact
                  style={{
                    borderRadius: 4,
                    minWidth: 0,
                    paddingHorizontal: 8,
                  }}
                  labelStyle={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 12,
                    lineHeight: 12 * 1.2,
                    fontWeight: '600',
                  }}
                  onPress={() => console.log('Pressed')}>
                  Start Chatting with Webdock AI
                </Button>
              </View>
            </View>
          </View>
        </View>
        <Spacer size={1} />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
            paddingVertical: 15,
            paddingHorizontal: 12,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}>
            <Image
              source={{
                uri: !account.userAvatar
                  ? 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                  : account.userAvatar.startsWith('https://')
                  ? account.userAvatar
                  : 'https:' + account.userAvatar,
              }}
              style={{width: 35, height: 35}}
            />
            <Spacer size={20} horizontal />
            <View style={{flex: 1, alignSelf: 'flex-start'}}>
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 16,
                  lineHeight: 16 * 1.2,
                  fontWeight: '600',
                  color: theme.colors.text,
                }}>
                Chatting with Support is good for...
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Light',
                  fontSize: 12,
                  lineHeight: 12 * 1.2,
                  fontWeight: '300',
                  color: theme.colors.text,
                }}>
                {'\u2022'} Getting hands-on fixes and support from a real human.
                {'\n'}
                {'\u2022'}
                Fixing billing issues, network issues and problems with your
                server.{'\n'}
                {'\u2022'} Reporting crashes or otherwise unexpected behavior.
              </Text>
              <View style={{alignSelf: 'flex-start'}}>
                <Spacer size={12} />
                <Button
                  mode="outlined"
                  textColor={theme.colors.text}
                  compact
                  style={{
                    borderColor: theme.colors.primary,
                    borderRadius: 4,
                    minWidth: 0,
                    paddingHorizontal: 8,
                  }}
                  labelStyle={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 12,
                    lineHeight: 12 * 1.2,
                    fontWeight: '600',
                    includeFontPadding: false,
                  }}
                  onPress={() => show()}>
                  Start Chatting with Support
                </Button>
              </View>
            </View>
          </View>
        </View>
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
