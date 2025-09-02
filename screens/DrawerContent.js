import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import {useTheme, Text, IconButton, Divider, Icon} from 'react-native-paper';

import {AuthContext} from '../components/context';
import {getAccountInformations} from '../service/accountInformations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutIcon from '../assets/logout.svg';
import {resetSession} from 'react-native-crisp-chat-sdk';
import {Pressable, ScrollView} from 'react-native';
import {getMainMenu} from '../service/menu';
import {getReadableVersion, getVersion} from 'react-native-device-info';
import {SvgFromUri, SvgUri} from 'react-native-svg';
import Tiktok from '../assets/tiktok.svg';
export function DrawerContent({props, navigation}) {
  const {signOut} = React.useContext(AuthContext);
  const [account, setAccountInfo] = useState();
  const [mainMenu, setMainMenu] = useState();
  const [isLoading, setIsLoading] = useState(true);

  // const activeRouteName = state.routeNames[state.index];
  useEffect(() => {
    (async () => {
      // Load from AsyncStorage first
      try {
        const cachedMenu = await AsyncStorage.getItem('@mainMenuCache');
        if (cachedMenu) {
          setMainMenu(JSON.parse(cachedMenu));
        }
      } catch (e) {
        // ignore cache errors
      }
      setTimeout(async () => {
        let userToken = null;
        try {
          setIsLoading(true);
          userToken = await AsyncStorage.getItem('userToken');
          getAccountInformations(userToken).then(
            data => {
              setAccountInfo(data);
              setIsLoading(false);
            },
            error => {
              Alert.alert('Error', 'Something went wrong!');
              setIsLoading(false);
            },
          );
          getMainMenu(userToken).then(async data => {
            // Only update if changed
            try {
              const newMenu = data.menu;
              const cachedMenu = await AsyncStorage.getItem('@mainMenuCache');
              if (
                !cachedMenu ||
                JSON.stringify(JSON.parse(cachedMenu)) !==
                  JSON.stringify(newMenu)
              ) {
                await AsyncStorage.setItem(
                  '@mainMenuCache',
                  JSON.stringify(newMenu),
                );
                setMainMenu(newMenu);
              } else if (!mainMenu) {
                setMainMenu(newMenu); // ensure state is set if not already
              }
            } catch (e) {
              setMainMenu(data.menu);
            }
          });
        } catch (e) {
          alert(e);
          setIsLoading(false);
        }
      }, 0);
    })();
  }, []);
  const theme = useTheme();

  const MenuLevel2 = ({items, onPress}) => {
    return (
      <View style={{gap: 4, paddingTop: 10}}>
        {items.map(item => (
          <Pressable
            key={item.title}
            onPress={() => onPress(item.url)}
            android_ripple={{color: '#ccc'}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 46,
            }}>
            {item.icon != '' ? (
              item.icon.endsWith('.svg') ? (
                <SvgUri
                  width={16}
                  height={16}
                  uri={
                    'https://webdock.io' + theme.dark
                      ? item.icon_dark
                      : item.icon
                  }
                />
              ) : (
                <Image
                  source={{
                    uri:
                      'https://webdock.io' + theme.dark
                        ? item.icon_dark
                        : item.icon,
                  }}
                  style={{width: 16, height: 16, backgroundColor: 'red'}}
                />
              )
            ) : null}
            <Text
              style={{
                fontSize: 13,
                fontFamily: 'Poppins-Light',
                fontWeight: '300',
                includeFontPadding: false,
              }}>
              {item.title}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const MenuLevel1 = ({items, expanded, toggleExpand, onPress}) => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.menu.surface,
          borderRadius: 10,
          gap: 16,
          padding: 20,
        }}>
        {items.map(item => {
          const isExpanded = expanded[item.title];
          const hasChildren =
            Array.isArray(item.children) && item.children.length > 0;

          return (
            <View key={item.title}>
              <Pressable
                onPress={() =>
                  hasChildren ? toggleExpand(item.title) : onPress(item.url)
                }
                android_ripple={{color: '#ccc'}}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 10,
                  }}>
                  {item.icon != '' ? (
                    item.icon.endsWith('.svg') ? (
                      <SvgUri
                        width={20}
                        height={20}
                        uri={
                          'https://webdock.io' + theme.dark
                            ? item.icon_dark
                            : item.icon
                        }
                      />
                    ) : (
                      <Image
                        source={{
                          uri:
                            'https://webdock.io' + theme.dark
                              ? item.icon_dark
                              : item.icon,
                        }}
                        style={{width: 20, height: 20, backgroundColor: 'red'}}
                      />
                    )
                  ) : null}
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: 'Poppins',
                      includeFontPadding: false,
                    }}>
                    {item.title}
                  </Text>
                </View>
                {hasChildren && (
                  <Text>
                    {isExpanded ? (
                      <Icon
                        source="chevron-up"
                        size={18}
                        color={theme.colors.primary}
                      />
                    ) : (
                      <Icon
                        source="chevron-down"
                        size={18}
                        color={theme.colors.primary}
                      />
                    )}
                  </Text>
                )}
              </Pressable>

              {hasChildren && isExpanded && (
                <MenuLevel2 items={item.children} onPress={onPress} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const MenuLevel0 = ({data}) => {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = key => {
      setExpanded(prev => ({...prev, [key]: !prev[key]}));
    };

    const handlePress = url => {
      // Check if URL already contains a domain (including subdomains)
      const hasDomain =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/.test(
          url,
        );
      if (hasDomain) {
        // URL already has a domain, just ensure it has a protocol
        if (!url.includes('https://') && !url.includes('http://')) {
          url = 'https://' + url;
        }
      } else {
        // URL is a relative path, prepend the base domain
        url = 'https://webdock.io' + url;
      }
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
        }
      });
    };

    return data?.map(item => {
      const hasChildren =
        Array.isArray(item.children) && item.children.length > 0;

      return (
        <View key={item.title} style={{}}>
          <Pressable
            onPress={() => {
              if (!hasChildren) handlePress(item.url);
            }}
            android_ripple={{color: '#ccc'}}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 12,
            }}>
            {item.icon ? (
              <Image
                source={{
                  uri:
                    'https://webdock.io' + theme.dark
                      ? item.icon_dark
                      : item.icon,
                }}
                style={{width: 24, height: 24, backgroundColor: 'red'}}
              />
            ) : null}
            <Text
              style={{
                fontSize: 22,
                fontFamily: 'Poppins-Medium',
                fontWeight: '500',
              }}>
              {item.title}
            </Text>
          </Pressable>

          {(hasChildren && (
            <MenuLevel1
              items={item.children}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onPress={handlePress}
            />
          )) || <Divider />}
        </View>
      );
    });
  };
  const handlePress = async (inputUrl, appScheme) => {
    let url = inputUrl.trim();

    // If already http/https, keep
    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      const hasDomain =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(
          url,
        );
      if (hasDomain) {
        url = `https://${url}`;
      } else {
        if (!url.startsWith('/')) url = '/' + url;
        url = `https://webdock.io${url}`;
      }
    }

    try {
      // Try app scheme first if provided
      if (appScheme) {
        const supported = await Linking.canOpenURL(appScheme);
        if (supported) {
          return Linking.openURL(appScheme);
        }
      }

      // Then fallback to https:// url
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        return Linking.openURL(url);
      }

      // Finally open inside your WebViewScreen
      navigation.navigate('WebViewScreen', {uri: url, token: ''});
    } catch (err) {
      console.warn('Failed to open url:', err);
      navigation.navigate('WebViewScreen', {uri: url, token: ''});
    }
  };

  const openWebView = async url => {
    navigation.navigate('WebViewScreen', {
      uri: url,
      tokenType: 'query',
      token: await AsyncStorage.getItem('userToken'),
    });
  };
  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.menu.background,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.drawerContent}>
          {isLoading ? (
            <View
              style={{
                padding: 20,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100,
              }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 10,
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                Loading account information...
              </Text>
            </View>
          ) : account ? (
            <Pressable
              onPress={() =>
                openWebView('https://webdock.io/en/dash/editprofile')
              }
              style={{
                padding: 20,
                backgroundColor: theme.colors.menu.surface,
                borderRadius: 4,
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
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
                    gap: 5,
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
              </View>
            </Pressable>
          ) : (
            <View
              style={{
                padding: 20,
                backgroundColor: theme.colors.surface,
                borderRadius: 4,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: theme.colors.error,
                }}>
                Failed to load account information
              </Text>
            </View>
          )}
          <View>
            <MenuLevel0 data={mainMenu} />
          </View>
        </ScrollView>
      </View>
      <View
        style={[
          styles.bottomDrawerSection,
          {backgroundColor: theme.colors.surface},
        ]}>
        <Pressable
          onPress={() => {
            resetSession();
            signOut();
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
          }}>
          <LogoutIcon width={24} height={24} color={theme.colors.text} />
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              fontWeight: '500',
              fontSize: 22,
            }}>
            Sign Out
          </Text>
        </Pressable>
        <Divider />

        <View style={{paddingVertical: 20}}>
          <Text
            style={{
              fontFamily: 'Poppins',
              fontSize: 12,
              color: theme.colors.accent,
              opacity: 0.56,
            }}>
            Follow Webdock on
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
            <View>
              <IconButton
                icon="youtube"
                style={{width: 48, height: 48}}
                onPress={() =>
                  handlePress(
                    'https://youtube.com/@webdock',
                    'youtube://www.youtube.com/@webdock',
                  )
                }
              />
            </View>
            <View>
              <IconButton
                icon="instagram"
                style={{width: 48, height: 48}}
                onPress={() =>
                  handlePress('https://www.instagram.com/webdock.io/')
                }
              />
            </View>
            <View>
              <IconButton
                icon={() => (
                  <Tiktok
                    width={24}
                    height={24}
                    fill={theme.dark ? 'white' : '#565656'}
                  />
                )}
                style={{width: 48, height: 48}}
                onPress={() =>
                  handlePress('https://www.tiktok.com/@webdock.io')
                }
              />
            </View>
            <View>
              <IconButton
                icon="linkedin"
                style={{width: 48, height: 48}}
                onPress={() =>
                  handlePress('https://www.linkedin.com/company/webdock-io/')
                }
              />
            </View>
            <View>
              <IconButton
                icon="facebook"
                style={{width: 48, height: 48}}
                onPress={() =>
                  handlePress('https://www.facebook.com/webdockio')
                }
              />
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.menu.surface,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}>
        <Text style={{fontFamily: 'Poppins', fontSize: 12, color: '#BDBDBD'}}>
          Version number {getReadableVersion()}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    gap: 8,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontFamily: 'Raleway-Bold',
    includeFontPadding: false,
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    flexWrap: 'wrap',
    includeFontPadding: false,
    fontFamily: 'Raleway-Normal',
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
  drawerSection: {},
  bottomDrawerSection: {
    paddingHorizontal: 20,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
