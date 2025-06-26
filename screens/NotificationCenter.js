import React, {useEffect, useState} from 'react';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Keyboard,
  SectionList,
  InteractionManager,
} from 'react-native';
import {
  IconButton,
  Button,
  Divider,
  HelperText,
  Snackbar,
  Checkbox,
  Menu,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import EventItem from '../components/EventItem';
import NewsItem from '../components/NewsItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getNews} from '../service/news';
import {getEvents} from '../service/events';
import {
  BottomSheetFlatList,
  BottomSheetSectionList,
} from '@gorhom/bottom-sheet';
import ThumbsUp from '../assets/thumbs-up.svg';
import Modal from 'react-native-modal';

const initialLayout = {width: Dimensions.get('window').width};

export default function NotificationCenter({navigation}) {
  const [servers, setServers] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    {key: 'alerts', title: 'Alerts'},
    {key: 'events', title: 'Events'},
    {key: 'news', title: 'News'},
  ]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);
  const search = () => {
    if (searchQuery) {
      const newData = servers.filter(item => {
        const itemData = `${item.name.toUpperCase()} 
                  ${item.location.toUpperCase()} 
                  ${item.ipv4.toUpperCase()}
                  ${item.ipv6.toUpperCase()}`;

        const textData = searchQuery.toUpperCase();

        return itemData.indexOf(textData) > -1;
      });
      setFilteredServers(newData);
      setRerenderFlatList(!renderStatusIcon);
    }
  };
  const [isFetching, setIsFetching] = useState(false);
  const [rerenderFlatList, setRerenderFlatList] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    const task = InteractionManager.runAfterInteractions(() => {
      onBackgroundRefresh();
    });

    return () => {
      task.cancel();
      unsubscribe();
    };
  }, [navigation]);
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getNews(userToken).then(data => {
        setNews(data.results);
      });
      getEvents(userToken, 1).then(data => {
        setEvents(data);
      });
      setIsFetching(false);
    } catch (e) {
      alert(e);
      setIsFetching(false);
    }
  };
  const formatDateGroup = inputDate => {
    const date = new Date(inputDate);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const isSameYear = date.getFullYear() === now.getFullYear();

    const options = {
      month: 'long',
      day: 'numeric',
      ...(isSameYear ? {} : {year: 'numeric'}),
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const groupByFormattedDate = events => {
    const grouped = {};

    events.forEach(event => {
      const dateLabel = formatDateGroup(event.startTime);
      if (!grouped[dateLabel]) grouped[dateLabel] = [];
      grouped[dateLabel].push(event);
    });

    return Object.entries(grouped).map(([title, data]) => ({title, data}));
  };
  const [eventDetailsModal, setEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);

  const openSheet = event => {
    setEventDetails(event);
    setEventDetailsModal(true);
  };
  const renderScene = SceneMap({
    alerts: () => (
      // <BottomSheetFlatList
      //   data={
      //     searchQuery
      //       ? searchQuery.length === 0
      //         ? servers
      //         : filteredServers
      //       : servers
      //   }
      //   keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
      //   refreshing={isFetching}
      //   onRefresh={onBackgroundRefresh}
      //   style={{flex: 1}}
      //   contentContainerStyle={{paddingBottom: 20}}
      //   ListEmptyComponent={
      //     <View
      //       style={{
      //         paddingVertical: 24,
      //         backgroundColor: theme.colors.surface,
      //         gap: 11,
      //         justifyContent: 'center',
      //         alignItems: 'center',
      //       }}>
      //       <Text style={{textAlign: 'center', color: theme.colors.text}}>
      //         Nice Job!
      //       </Text>
      //       <Text style={{textAlign: 'center', color: theme.colors.text}}>
      //         You have no notifications.
      //       </Text>
      //       <ThumbsUp color={theme.colors.text} />
      //     </View>
      //   }
      //   renderItem={({item}) => (
      //     <TouchableOpacity
      //       onPress={() =>
      //         navigation.navigate('ServerManagement', {
      //           slug: item.slug,
      //           name: item.name,
      //           description: item.description,
      //           notes: item.notes,
      //           nextActionDate: item.nextActionDate,
      //         })
      //       }>
      //       <View>
      //         <ServerItem
      //           title={item.name}
      //           alias={item.aliases[0]}
      //           dc={item.location}
      //           virtualization={item.virtualization}
      //           profile={item.profile}
      //           ipv4={item.ipv4}
      //           status={item.status}
      //         />
      //         <View style={{height: 10}} />
      //       </View>
      //     </TouchableOpacity>
      //   )}
      //   extraData={rerenderFlatList}
      //   showsVerticalScrollIndicator={false}
      // />
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
          Coming soon.
        </Text>
      </View>
    ),

    events: () => (
      <BottomSheetSectionList
        sections={groupByFormattedDate(searchQuery?.length ? events : events)}
        keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
        refreshing={isFetching}
        onRefresh={onBackgroundRefresh}
        style={{flex: 1}}
        // scrollEnabled={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{paddingBottom: 20}}
        ListEmptyComponent={
          events && events.length === 0 ? (
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
                No events have been triggered yet ...
              </Text>
            </View>
          ) : null
        }
        renderSectionHeader={({section: {title}}) => (
          <>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 10,
                paddingTop: 14,
                paddingBottom: 4,
                paddingHorizontal: 14,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
              }}>
              {title}
            </Text>
            <View style={{height: 1}} />
          </>
        )}
        renderItem={({item}) => (
          <>
            <EventItem
              key={item.id}
              action={item.action}
              actionData={item.actionData}
              startTime={item.startTime}
              status={item.status}
              message={item.message}
              onDetailsPress={item =>
                openSheet({
                  message: item.message,
                })
              }
            />
            <View style={{height: 1}} />
          </>
        )}
      />
    ),
    news: () => (
      <FlatList
        style={{
          backgroundColor: theme.colors.surface,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          padding: 12,
          flex: 1,
        }}
        scrollEnabled={false}
        data={news}
        keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() => navigation.navigate('News', {})}>
            <NewsItem
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate('WebViewScreen', {
                  uri: 'https://webdock.io/en/docs/webdock-news/' + item.slug,
                  token: 'abc123',
                })
              }
            />
            <View style={{height: 12}} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          news?.length === 0 ? (
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
                There is no news at the moment.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
      />
    ),
  });

  const [visible, setVisible] = useState(false);
  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };
  const theme = useTheme();
  return (
    <>
      <BottomSheetWrapper
        title="Notification Center"
        isScrollableContent={false}
        onClose={() => navigation.goBack()}>
        <View
          style={{
            flex: 1,
            minHeight: '100%',
            width: '100%',
            gap: 24,
            paddingHorizontal: 20,
            backgroundColor: theme.colors.background,
          }}>
          {index === 1 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'nowrap',
                width: '100%',
                gap: 16,
              }}>
              <View style={{flex: 1, height: 38}}>
                <TextInput
                  mode="flat"
                  label="Search Events"
                  dense
                  multiline={false}
                  onChangeText={searchtext => {
                    onChangeSearch(searchtext);
                    search();
                  }}
                  style={{
                    flex: 1,
                    height: 38,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 4,
                    justifyContent: 'center',
                  }}
                  contentStyle={{
                    paddingVertical: 0,
                    height: 38,
                    fontFamily: 'Poppins',
                    fontWeight: '400',
                    fontSize: 12,
                    lineHeight: 12,
                    includeFontPadding: false,
                  }}
                  left={
                    <TextInput.Icon icon="magnify" color={theme.colors.text} />
                  }
                  underlineColor="transparent"
                  theme={{
                    colors: {
                      primary: 'transparent',
                      text: theme.colors.text,
                      placeholder: theme.colors.text,
                      background: theme.colors.surface,
                    },
                    roundness: 4,
                  }}
                />
              </View>

              <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchorPosition="bottom"
                style={{
                  shadowOpacity: 0.1,
                  borderRadius: 4,
                  backgroundColor: theme.colors.surface,
                }}
                contentStyle={{
                  width: 160,
                  backgroundColor: theme.colors.surface,
                }}
                anchor={
                  <IconButton
                    style={{
                      height: 38,
                      width: 38,
                      margin: 0,
                      padding: 0,
                      backgroundColor: theme.colors.surface,
                      borderRadius: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    icon="swap-vertical"
                    size={24}
                    iconColor={theme.colors.text}
                    onPress={openMenu}
                  />
                }>
                <Menu.Item
                  title="Only active servers"
                  onPress={() => {}}
                  titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
                />
                <Menu.Item
                  title="All Servers including deleted"
                  onPress={() => {}}
                  titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
                />
              </Menu>
            </View>
          )}

          <View style={{flex: 1}}>
            <TabView
              navigationState={{index, routes}}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={initialLayout}
              lazy
              lazyPreloadDistance={0}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  indicatorStyle={{
                    height: 1,
                    backgroundColor: theme.colors.primaryText,
                  }}
                  activeColor={theme.colors.text}
                  pressColor={theme.colors.surface}
                  inactiveColor="#99A199"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderTopWidth: 0,
                  }}
                />
              )}
            />
          </View>
        </View>
      </BottomSheetWrapper>
      <Modal
        testID={'modal'}
        isVisible={eventDetailsModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setEventDetailsModal(false)}
        style={{justifyContent: 'flex-start', marginHorizontal: 20}}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 4,
          }}>
          <View
            style={{
              backgroundColor: theme.colors.accent,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderTopStartRadius: 4,
              borderTopEndRadius: 4,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 16,
                color: 'white',
                includeFontPadding: false,
              }}>
              Event details
            </Text>
            <IconButton
              icon="close"
              size={24}
              iconColor="white"
              onPress={() => setEventDetailsModal(false)}
              style={{
                padding: 0,
                margin: 0,
              }}
            />
          </View>
          <View
            style={{
              padding: 12,
              gap: 12,
            }}>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 10,
                borderColor: '#000000',
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 4,
                padding: 16,
              }}>
              {eventDetails.message}
            </Text>
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
              onPress={() => setEventDetailsModal(false)}>
              Okay, thanks
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({});
