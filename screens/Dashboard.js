import React, {
  useState,
  useEffect,
  PureComponent,
  useRef,
  useCallback,
} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  UIManager,
  LayoutAnimation,
  Pressable,
  Share,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  ActivityIndicator,
  Colors,
  FAB,
  Searchbar,
  IconButton,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Menu,
  useTheme,
  Chip,
  Badge,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {getServers, provisionAServer} from '../service/servers';
import {AuthContext} from '../components/context';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getImages,
  getLocations,
  getProfiles,
} from '../service/serverConfiguration';
import {SvgUri, SvgXml} from 'react-native-svg';
import SVGCpu from '../assets/icon-cpu.svg';
import SVGRam from '../assets/icon-ram2.svg';
import SVGStorage from '../assets/icon-storage.svg';
import IconOcticons from 'react-native-vector-icons/Octicons';
import {getServerSnapshots} from '../service/serverSnapshots';
import MenuIcon from '../assets/menu-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import SearchIcon from '../assets/search-icon.svg';
import PowerIcon from '../assets/power-icon.svg';
import DropdownIcon from '../assets/dropdown-icon.svg';
import CirclePercent from '../assets/circle-percent.svg';
import ThumbsUp from '../assets/thumbs-up.svg';
import ArrowIcon from '../assets/arrow-icon.svg';
import {getEventsPerPage, getAllEvents} from '../service/events';
import EmptyList from '../components/EmptyList';
import {getNews} from '../service/news';
import Spacer from '../components/Spacer';
import NewsItem from '../components/NewsItem';
import ServerItem from '../components/ServerItem';
import {CopilotStep, useCopilot, walkthroughable} from 'react-native-copilot';
import BootSplash from 'react-native-bootsplash';
import CallbackStatusWatcher from '../components/CallbackStatusWatcher';
import requestUserPermission from '../service/notifications';
import EventItem from '../components/EventItem';

const ONBOARDING_KEY = 'hasShownCopilot';

export function Dashboard({navigation}) {
  const serversCache = useRef(null);
  const newsCache = useRef(null);
  const notificationsCache = useRef(null);
  const [servers, setServers] = useState();
  const [news, setNews] = useState();
  const [notifications, setNotifications] = useState();
  const [loading, setLoading] = useState(true);
  const {start, copilotEvents} = useCopilot();
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const checkIfAlreadyShown = async () => {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!value) {
        setIsFirstRun(true);
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      }
    };

    checkIfAlreadyShown();
  }, []);

  useEffect(() => {
    if (isFirstRun) {
      // Optional delay to ensure steps are mounted
      setTimeout(() => start(), 500);
    }
  }, [isFirstRun]);

  useEffect(() => {
    const listener = () => {
      // Copilot tutorial finished!
    };
    const requestNotification = step => {
      if (step.name === 'openNotificationCenter') {
        console.log('Requestinguserperms');
        requestUserPermission();
      }
    };

    copilotEvents.on('stop', listener);
    const init = async () => {
      // …do multiple sync or async tasks
    };
    copilotEvents.on('stepChange', requestNotification);

    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash has been hidden successfully');
    });
    const unsubscribe = navigation.addListener('focus', async () => {
      if (serversCache.current) {
        setServers(serversCache.current);
      } else {
        await fetchServers();
      }
      if (newsCache.current) {
        setNews(newsCache.current);
      } else {
        await fetchNews();
      }
      if (notificationsCache.current) {
        setNotifications(notificationsCache.current);
      } else {
        await fetchNotifications();
      }
      // Fetch latest events for notification center
      await fetchEvents();
    });
    setTimeout(async () => {
      onBackgroundRefresh();
      await fetchEvents();
    }, 0);
    return () => {
      copilotEvents.off('stop', listener);
      copilotEvents.off('stepChange', requestNotification);
    };
  }, [navigation]);

  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      console.log(loading);
      userToken = await AsyncStorage.getItem('userToken');
      getServers(userToken).then(data => {
        const sorter = (a, b) => {
          var dA = a.date.split(' ');
          var dB = b.date.split(' ');
          var dateA = Date.parse(dA[0] + 'T' + dA[1]),
            dateB = Date.parse(dB[0] + 'T' + dB[1]);

          return dateB - dateA;
        };
        setServers(data.sort(sorter).slice(0, 3));
      });
      getNews(userToken).then(data => {
        setNews(data.results);
      });
      setLoading(false);
    } catch (e) {
      alert(e);
      setLoading(false);
    }
  };
  const renderEventStatusIcon = icon => {
    if (icon == 'error') {
      return <Icon name="info-outline" size={14} color="red" />;
    } else if (icon == 'finished') {
      return <Icon name="done" size={14} color="green" />;
    } else if (icon == 'waiting') {
      return (
        <ActivityIndicator animating={true} size={10} color={Colors.blue400} />
      );
    } else if (icon == 'working') {
      return (
        <ActivityIndicator animating={true} size={10} color={Colors.blue400} />
      );
    }
    return null;
  };

  const renderStatusIcon = icon => {
    if (icon == 'error') {
      return <PowerIcon width={14} height={14} fill="red" />;
    } else if (icon == 'running') {
      return <PowerIcon width={14} height={14} fill="#4C9F5A" />;
    } else if (icon == 'stopped') {
      return <PowerIcon width={14} height={14} fill="#E15241" />;
    } else if (
      icon == 'provisioning' ||
      icon == 'rebooting' ||
      icon == 'starting' ||
      icon == 'stopping' ||
      icon == 'reinstalling'
    ) {
      return (
        <ActivityIndicator animating={true} size={10} color={Colors.blue400} />
      );
    }
    return null;
  };

  const [isFetching, setIsFetching] = useState(false);
  const fetchServers = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServers(userToken).then(data => {
        const sorter = (a, b) => {
          var dA = a.date.split(' ');
          var dB = b.date.split(' ');
          var dateA = Date.parse(dA[0] + 'T' + dA[1]),
            dateB = Date.parse(dB[0] + 'T' + dB[1]);

          return dateB - dateA;
        };

        setServers(data.sort(sorter).slice(0, 4));
        setIsFetching(false);
        serversCache.current = data;
      });
    } catch (e) {
      alert(e);
    }
  };
  const fetchNews = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getNews(userToken).then(data => {
        setNews(data.results);
        setIsFetching(false);
        newsCache.current = data.results;
      });
    } catch (e) {
      alert(e);
    }
  };
  const fetchNotifications = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      // Assuming getNotifications returns an array of notifications
      // For now, we'll just set it to an empty array or null if no data
      setNotifications([]); // Placeholder, replace with actual notification fetching
      setIsFetching(false);
      notificationsCache.current = []; // Placeholder, replace with actual notification fetching
    } catch (e) {
      alert(e);
    }
  };
  const fetchEvents = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      const data = await getAllEvents(userToken);
      // Sort by date descending and take 3 latest
      const sorted = data.sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime),
      );
      setEvents(sorted.slice(0, 3));
      setIsFetching(false);
    } catch (e) {
      alert(e);
      setIsFetching(false);
    }
  };
  const WalkthroughableText = walkthroughable(Text);
  const WalkthroughableIconButton = walkthroughable(IconButton);
  const WalkthroughableView = walkthroughable(Pressable);

  const theme = useTheme();

  const onShare = async () => {
    try {
      const value = await AsyncStorage.getItem('accountInfo');
      const accountInfo = JSON.parse(value);
      console.log(accountInfo);
      const result = await Share.share({
        message: 'Join Webdock ' + accountInfo.referralURl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('❌ Error sharing:', error.message);
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
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.surface,
        }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            paddingVertical: 10,
            height: '100%',
          }}>
          <CallbackStatusWatcher
            style={{marginBottom: 20}}
            onFinished={() => {
              console.log('Event completed!');
            }}
          />
          <CopilotStep
            title=""
            text="Refer a friend|Click the “Refer” button and and start inviting friends and earn credits to use for future payments."
            order={3}
            name="referAFriend">
            <WalkthroughableView
              onPress={onShare}
              style={{
                flexDirection: 'row',
                height: 42,
                borderRadius: 4,
                backgroundColor: theme.colors.primary,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}>
              <CirclePercent />
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 14,
                  fontWeight: '600',
                  includeFontPadding: false,
                  color: 'black',
                }}>
                Refer a Friend and Earn Credits
              </Text>
            </WalkthroughableView>
          </CopilotStep>

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
                All VPS Servers
              </Text>
            </View>
            {loading ? (
              <View
                style={{
                  height: '80%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="small" color="#00A1A1" />
              </View>
            ) : (
              <FlatList
                style={{}}
                data={servers}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                onRefresh={() => fetchServers()}
                ListEmptyComponent={
                  servers && servers.length === 0 && !isFetching ? (
                    <View
                      style={{
                        padding: 14,
                        gap: 16,
                        backgroundColor: theme.colors.surface,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins',
                          fontSize: 14,
                          color: theme.colors.text,
                        }}>
                        You have no servers.{' '}
                        <Text style={{color: theme.colors.primary}}>
                          Create a server
                        </Text>{' '}
                        and it will be listed here.
                      </Text>
                      <Button
                        mode="contained"
                        textColor={'black'}
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
                        onPress={() =>
                          openWebView('https://webdock.io/en/pricing')
                        }>
                        Create a Server
                      </Button>
                    </View>
                  ) : null
                }
                refreshing={isFetching}
                renderItem={({item}) => (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ServerManagement', {
                          slug: item.slug,
                          name: item.name,
                          description: item.description,
                          notes: item.notes,
                          nextActionDate: item.nextActionDate,
                        })
                      }>
                      <View>
                        <ServerItem
                          title={item.name}
                          alias={item.aliases[0]}
                          dc={item.location}
                          virtualization={item.virtualization}
                          profile={item.profile}
                          ipv4={item.ipv4}
                          status={item.status}
                        />
                      </View>
                    </TouchableOpacity>
                    <View
                      style={{
                        height: 1,
                        width: '100%',
                      }}
                    />
                  </>
                )}
                keyExtractor={item => item.slug}
              />
            )}
            {servers ? (
              servers.length > 0 ? (
                <View
                  style={{
                    height: 42,
                    backgroundColor: theme.colors.surface,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    padding: 12,
                    alignItems: 'flex-end',
                  }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Servers')}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontWeight: '400',
                        fontSize: 12,
                        includeFontPadding: false,
                        color: theme.colors.primaryText,
                      }}>
                      All Servers →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            ) : null}
          </View>
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
                Notification center
              </Text>
            </View>
            {loading ? (
              <View
                style={{
                  height: '80%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator size="small" color="#00A1A1" />
              </View>
            ) : (
              <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={events}
                scrollEnabled={false}
                removeClippedSubviews={true}
                renderItem={({item}) => (
                  <View key={item.id}>
                    <EventItem
                      key={item.id}
                      action={item.action}
                      actionData={item.actionData}
                      startTime={item.startTime}
                      status={item.status}
                      message={item.message}
                      onDetailsPress={() =>
                        openSheet({
                          message: !item.message ? item.action : item.message,
                        })
                      }
                    />
                    <View style={{height: 1}} />
                  </View>
                )}
                ListEmptyComponent={
                  events && events.length === 0 && !isFetching ? (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        paddingVertical: 24,
                        backgroundColor: theme.colors.surface,
                        gap: 11,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottomRightRadius: 4,
                        borderBottomLeftRadius: 4,
                      }}>
                      <Text
                        style={{textAlign: 'center', color: theme.colors.text}}>
                        Nice Job!
                      </Text>
                      <Text
                        style={{textAlign: 'center', color: theme.colors.text}}>
                        You have no notifications.
                      </Text>
                      <ThumbsUp color={theme.colors.text} />
                    </View>
                  ) : null
                }
                keyExtractor={item => item.id}
              />
            )}
          </View>
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
                News
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 4,
                padding: 12,
              }}>
              <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                data={news}
                scrollEnabled={false}
                removeClippedSubviews={true}
                renderItem={({item}) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => {
                        navigation.navigate('WebViewScreen', {
                          uri: item.link,
                          token: 'abc123',
                        });
                      }}>
                      <NewsItem
                        key={item.id}
                        item={item}
                        onPress={() =>
                          navigation.navigate('WebViewScreen', {
                            uri:
                              'https://webdock.io/en/docs/webdock-news/' +
                              item.slug,
                            token: 'abc123',
                          })
                        }
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        height: 12,
                      }}></View>
                  </View>
                )}
                ListEmptyComponent={
                  news && news.length === 0 && !isFetching ? (
                    <EmptyList />
                  ) : null
                }
                keyExtractor={item => item.slug}
              />
            </View>
          </View>
        </ScrollView>
        <CopilotStep
          text="Choose your display mode|Pick the color scheme that suits you best. You can change this anytime in your account Settings."
          order={4}
          name="chooseYourDisplayMode">
          <WalkthroughableView style={styles.fakeAnchor} />
        </CopilotStep>
      </SafeAreaView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 5,
  },
  logo: {
    width: '20%',
    alignItems: 'center',
  },
  logoitem: {},
  midinfo: {
    width: '65%',
    flex: 1,
    textAlign: 'left',
    marginHorizontal: '5%',
    justifyContent: 'center', //Centered vertically
    flex: 1,
  },
  status: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeAnchor: {
    position: 'absolute',
    top: '50%',
    left: '100%',
    width: 1,
    height: 1,
    marginLeft: -0.5,
    marginTop: -0.5,
  },
});
