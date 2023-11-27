import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  useTheme,
  Avatar,
  Title,
  Caption,
  Paragraph,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
} from 'react-native-paper';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';

import Icon from 'react-native-vector-icons/MaterialIcons';
import {AuthContext} from '../components/context';
import {getAccountInformations} from '../service/accountInformations';
import AsyncStorage from '@react-native-community/async-storage';
import ServersIcon from '../assets/servers.svg';
import DashboardIcon from '../assets/dashboard.svg';
import NewsIcon from '../assets/news.svg';
import EventsIcon from '../assets/events.svg';
import TeamIcon from '../assets/team.svg';
import HelpIcon from '../assets/help.svg';
import ProfileIcon from '../assets/profile.svg';
import LogoutIcon from '../assets/logout.svg';
import FeedbackIcon from '../assets/feedback.svg';
import CreateServerIcon from '../assets/create-server.svg';
export function DrawerContent(props) {
  const {signOut} = React.useContext(AuthContext);
  const [account, setAccountInfo] = useState();
  const {state, navigation} = props;
  const activeRouteName = state.routeNames[state.index];
  useEffect(() => {
    setTimeout(async () => {
      console.table(props);
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');

        getAccountInformations(userToken).then(
          data => {
            setAccountInfo(data);
          },
          error => {
            Alert.alert('Error', 'Something went wrong!');
          },
        );
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);

  return account ? (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{flexDirection: 'row', marginTop: 15}}>
              <Avatar.Image
                source={{
                  uri: !account.userAvatar
                    ? 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
                    : account.userAvatar.startsWith('https://')
                    ? account.userAvatar
                    : 'https:' + account.userAvatar,
                }}
                size={50}
              />
              <View style={{marginLeft: 15, flexDirection: 'column'}}>
                <Title style={styles.title}>{account.userName}</Title>
                <Caption style={styles.caption}>{account.userEmail}</Caption>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.section}>
                <Caption style={styles.caption}>Balance: </Caption>
                <Paragraph style={[styles.paragraph, styles.caption]}>
                  {account.accountBalanceRaw / 100 +
                    ' ' +
                    account.accountBalanceCurrency}
                </Paragraph>
              </View>
            </View>
          </View>
          {/* Display the active tab */}
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <CreateServerIcon width={size} height={size} />
              )}
              activeBackgroundColor="#e0efef"
              activeTintColor="#00A1A1"
              focused={activeRouteName == 'CreateServer'}
              label="Create Server"
              onPress={() => {
                props.navigation.navigate('CreateServer');
              }}
            />
            <DrawerItem
              icon={({color, size}) => (
                <DashboardIcon width={size} height={size} />
              )}
              activeBackgroundColor="#e0efef"
              activeTintColor="#00A1A1"
              label="Overview"
              focused={activeRouteName == 'Dashboard'}
              onPress={() => {
                props.navigation.navigate('Dashboard');
              }}
            />
            <DrawerItem
              icon={({color, size}) => (
                <ServersIcon width={size} height={size} />
              )}
              activeBackgroundColor="#e0efef"
              activeTintColor="#00A1A1"
              focused={activeRouteName == 'Servers'}
              label="Servers"
              onPress={() => {
                props.navigation.navigate('Servers');
              }}
            />
            <DrawerItem
              icon={({color, size}) => (
                <EventsIcon width={size} height={size} />
              )}
              activeBackgroundColor="#e0efef"
              activeTintColor="#00A1A1"
              label="Events"
              focused={activeRouteName == 'Events'}
              onPress={() => {
                props.navigation.navigate('Events');
              }}
            />
            <DrawerItem
              icon={({color, size}) => (
                <ProfileIcon width={size} height={size} />
              )}
              activeBackgroundColor="#e0efef"
              activeTintColor="#00A1A1"
              label="Account"
              focused={activeRouteName == 'Account'}
              onPress={() => {
                props.navigation.navigate('Account');
              }}
            />
            <DrawerItem
              icon={({color, size}) => <HelpIcon width={size} height={size} />}
              label="Help"
              onPress={() => {
                Linking.openURL(
                  'https://webdock.io/en/docs/webdock-mobile-app',
                );
              }}
            />
            <DrawerItem
              icon={({color, size}) => <NewsIcon width={size} height={size} />}
              label="News"
              onPress={() => {
                Linking.openURL('https://news.webdock.io');
              }}
            />
            <DrawerItem
              icon={({color, size}) => (
                <FeedbackIcon width={size} height={size} />
              )}
              label="Feedback"
              onPress={() => {
                Linking.openURL('https://feedback.webdock.io');
              }}
            />
          </Drawer.Section>
          {/* <Drawer.Section title="Preferences">
                        <TouchableRipple>
                            <View style={styles.preference}>
                                <Text>Dark Theme</Text>
                                <View pointerEvents="none">
                                    <Switch value={true} color="#008570"/>
                                </View>
                            </View>
                        </TouchableRipple>
                    </Drawer.Section> */}
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        {/* <DrawerItem
          icon={({color, size}) => (
            <Icon name="help" color={color} size={size} />
          )}
          label="Live Chat"
          onPress={() => {}}
        /> */}
        <DrawerItem
          icon={({color, size}) => <LogoutIcon width={size} height={size} />}
          label="Sign Out"
          onPress={() => {
            signOut();
          }}
        />
      </Drawer.Section>
    </View>
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#008570" />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
