import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Linking,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  FlatList,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import MenuIcon from '../assets/menu-icon.svg';
import PubicKeyIcon from '../assets/public-key-icon.svg';
import CogsIcon from '../assets/cogs.svg';
import TeamIcon from '../assets/team-icon.svg';
import LegalDocsIcon from '../assets/legal-docs.svg';
import ScriptsIcon from '../assets/scripts-icon.svg';
import NotificationIcon from '../assets/notification-bell.svg';
import {getAccountInformations} from '../service/accountInformations';
import {Icon, useTheme} from 'react-native-paper';
import Spacer from '../components/Spacer';
import ThemeSwitch from '../components/ThemeSwitch';
import {ThemeContext} from '../components/ThemeContext';
import {useBottomSheet} from '../components/BottomSheetProvider';

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
  const [itemHeight, setItemHeight] = useState(0);
  const measuredCount = useRef(0);

  const onLayout = (event, index) => {
    const {height} = event.nativeEvent.layout;
    if (height > itemHeight) {
      setItemHeight(height);
    }
    measuredCount.current += 1;
  };
  const theme = useTheme();
  const tabs = [
    // {"label":"General","icon":<UserIcon width={30} height={30} color="#00a1a1" />,"navigate":"AccountInfo"},
    {
      label: 'Edit profile',
      icon: <CogsIcon width={20} height={20} color={'white'} />,
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'https://webdock.io/en/dash/editprofile',
    },
    {
      label: 'Team',
      description:
        'See current and past network, disk, memory and CPU activity for your server asd asdasdasdasdasdasdasd asdsa das saassa',
      icon: <TeamIcon width={20} height={20} color={'white'} />,
      navigate: 'https://webdock.io/en/dash/manageteam',
    },
    {
      label: 'Notification settings',
      icon: <NotificationIcon width={20} height={20} color={'white'} />,
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'Notification settings',
    },
    {
      label: 'Public keys',
      icon: <PubicKeyIcon width={20} height={20} color={'white'} />,
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      navigate: 'AccountPublicKeys',
    },
    {
      label: 'Scripts',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      icon: <ScriptsIcon width={20} height={20} color={'white'} />,
      navigate: 'AccountScripts',
    },
    {
      label: 'Legal documents',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
      icon: <LegalDocsIcon width={20} height={20} color={'white'} />,
      navigate: 'https://webdock.io/en/dash/profile',
    },
  ];
  const {isDark, toggleTheme} = useContext(ThemeContext);
  const handlePress = url => {
    if (!url.includes('https://') && !url.includes('http://')) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  const openWebView = async url => {
    navigation.navigate('WebViewScreen', {
      uri: url,
      tokenType: 'query',
      token: await AsyncStorage.getItem('userToken'),
    });
  };
  return account ? (
    <ScrollView
      width="100%"
      height="100%"
      showsVerticalScrollIndicator={false}
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
        <Pressable
          onPress={() => openWebView('https://webdock.io/en/dash/editprofile')}
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
                fontFamily: 'Poppins-Medium',
                textAlignVertical: 'center',
                fontSize: 12,
                lineHeight: 12 * 1.2,
                fontWeight: '500',
                color: '#7c7c7c',
              }}>
              Credit Balance:
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
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
        </Pressable>
      </View>
      <Spacer size={24} />
      <View>
        <ThemeSwitch
          options={[
            {key: 'light', label: 'Light mode', icon: 'white-balance-sunny'},
            {key: 'dark', label: 'Dark mode', icon: 'weather-night'},
          ]}
          onToggle={value => toggleTheme(value)}
          selectedOption={theme.dark ? 1 : 0}
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
        {tabs.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() =>
              item?.navigate?.includes('https://')
                ? openWebView(item.navigate)
                : navigation.navigate(item.navigate)
            }
            onLayout={e => onLayout(e, index)}
            style={{
              width: '48%',
              marginBottom: 10,
              height: itemHeight || undefined,
            }}>
            <View
              style={{
                padding: 12,
                borderRightWidth: 4,
                borderRightColor: theme.colors.primary,
                backgroundColor: '#022213',
                borderRadius: 10,
              }}>
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
                <View style={{height: 8}} />
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontWeight: '600',
                    fontSize: 14,
                    lineHeight: 14 * 1.2,
                    color: 'white',
                  }}>
                  {item.label}
                </Text>
                <View style={{height: 8}} />
                <Text
                  numberOfLines={4}
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
          </Pressable>
        ))}
      </View>
      <Spacer size={30} />
    </ScrollView>
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#008570" />
    </View>
  );
}
