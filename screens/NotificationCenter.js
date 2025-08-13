import React, {useEffect, useRef, useState} from 'react';
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
  Provider,
  Portal,
} from 'react-native-paper';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {FlatList, TouchableOpacity} from 'react-native-gesture-handler';
import EventItem from '../components/EventItem';
import NewsItem from '../components/NewsItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getNews} from '../service/news';
import {getEvents} from '../service/events';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import ThumbsUp from '../assets/thumbs-up.svg';
import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getServers} from '../service/servers';

const initialLayout = {width: Dimensions.get('window').width};
const layoutHeight = Dimensions.get('window').height - 200;
export default function NotificationCenter({navigation}) {
  const [servers, setServers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeServers, setActiveServers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    {key: 'alerts', title: 'Alerts'},
    {key: 'events', title: 'Events'},
    {key: 'news', title: 'News'},
  ]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);

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
    try {
      setIsFetching(true);
      const userToken = await AsyncStorage.getItem('userToken');

      const [newsData, eventsData, activeServersData] = await Promise.all([
        getNews(userToken),
        getEvents(userToken, 1),
        getServers(userToken),
      ]);

      setNews(newsData.results);
      setEvents(eventsData);
      setActiveServers(activeServersData); // 🔁 Save active servers
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
  const getProcessedEvents = () => {
    let processed = [...events];

    // 🔍 Apply search filter if any
    if (searchQuery?.length > 0) {
      processed = processed.filter(event => {
        const text = searchQuery.toLowerCase();
        return (
          event.message?.toLowerCase().includes(text) ||
          event.action?.toLowerCase().includes(text)
        );
      });
    }

    // ✅ Apply active server filtering if toggled
    if (selectedFilter === 'activeOnly' && activeServers.length > 0) {
      const activeSlugs = new Set(activeServers.map(s => s.slug));
      processed = processed.filter(event => activeSlugs.has(event.serverSlug));
    }

    // ⬆️ Sort: Active servers first
    const activeSlugs = new Set(activeServers.map(s => s.slug));
    processed.sort((a, b) => {
      const aActive = activeSlugs.has(a.serverSlug) ? 0 : 1;
      const bActive = activeSlugs.has(b.serverSlug) ? 0 : 1;
      return aActive - bActive;
    });

    return processed;
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
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'alerts':
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
        return (
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
        );
      case 'events':
        return (
          <View style={{flex: 1}}>
            <BottomSheetSectionList
              sections={groupByFormattedDate(getProcessedEvents())}
              keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
              style={{flexGrow: 1}}
              onRefresh={onBackgroundRefresh}
              // refreshing={isFetching}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{paddingBottom: 20}}
              ListHeaderComponent={
                isFetching ? (
                  <View
                    style={{
                      alignItems: 'center',
                      padding: 14,
                      gap: 16,
                      backgroundColor: theme.colors.surface,
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                    }}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: 8,
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        color: theme.colors.primary,
                      }}>
                      Loading events...
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                events && events.length === 0 && !isFetching ? (
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
                    onDetailsPress={() =>
                      openSheet({
                        message: !item.message ? item.action : item.message,
                      })
                    }
                  />
                  <View style={{height: 1}} />
                </>
              )}
            />
          </View>
        );
      case 'news':
        return (
          <BottomSheetFlatList
            style={{
              backgroundColor: theme.colors.surface,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              padding: 12,
              flex: 1,
            }}
            data={news}
            keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => navigation.navigate('News', {})}>
                <NewsItem
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navigation.navigate('WebViewScreen', {
                      uri:
                        'https://webdock.io/en/docs/webdock-news/' + item.slug,
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
        );
      default:
        return null;
    }
  };

  const [visible, setVisible] = useState(false);
  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };
  const theme = useTheme();

  const bottomSheetRef = useRef(null);

  useEffect(() => {
    let attempts = 0;

    const trySnap = () => {
      if (bottomSheetRef.current) {
        try {
          bottomSheetRef.current.snapToIndex(0);
        } catch (e) {
          Alert.alert('test', e);
        }
      }

      // If it hasn't opened yet, try again
      if (attempts < 5) {
        attempts++;
        setTimeout(trySnap, 100); // Retry every 100ms
      }
    };

    const task = InteractionManager.runAfterInteractions(() => {
      trySnap(); // try after interactions & layout
    });

    return () => {
      task.cancel();
    };
  }, []);

  const handleChange = index => {
    if (index === -1) {
      navigation.goBack();
    }
  };
  const snapPoints = ['93%'];
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          enableContentPanningGesture={false}
          enableHandlePanningGesture={false}
          enableDynamicSizing={false} // ✅ IMPORTANT
          detached={false} // avoid it floating freely
          onChange={handleChange}
          handleComponent={() => null}
          style={{
            backgroundColor: 'transparent',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginBottom: insets.bottom + 20,
          }}
          backgroundStyle={{
            backgroundColor: 'transparent',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleStyle={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 0,
          }}
          handleIndicatorStyle={{
            backgroundColor: theme.colors.text,
          }}
          backdropComponent={props => (
            <BottomSheetBackdrop
              {...props}
              appearsOnIndex={0}
              disappearsOnIndex={-1}
              pressBehavior="close"
            />
          )}>
          <BottomSheetView
            style={{
              flex: 1,
              flexDirection: 'column',
              padding: 0,
              margin: 0,
              gap: 0,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                backgroundColor: theme.colors.background,
              }}>
              <IconButton
                icon="close"
                size={30}
                color={theme.colors.text}
                onPress={() => navigation.goBack()}
                style={{
                  padding: 0,
                  margin: 0,
                }}
              />
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 22,
                  textAlign: 'center',
                  color: theme.colors.text,
                }}>
                Notification center
              </Text>
              <View style={{width: 30, height: 30}}></View>
            </View>
            <View
              style={{
                width: '100%',
                height: '100%',
                gap: 24,
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 80,
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
                      value={undefined}
                      onChangeText={searchtext => {
                        onChangeSearch(searchtext);
                      }}
                      placeholder="Search"
                      style={{
                        height: 38,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 4,
                        paddingVertical: 0,
                      }}
                      contentStyle={{
                        fontSize: 12,
                        lineHeight: 38,
                        fontFamily: 'Poppins',
                        fontWeight: '400',
                        includeFontPadding: false,
                      }}
                      underlineColor="transparent"
                      left={
                        <TextInput.Icon
                          icon="magnify"
                          color={theme.colors.text}
                        />
                      }
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
                      onPress={() => {
                        setSelectedFilter('activeOnly');
                        closeMenu();
                      }}
                      style={{
                        backgroundColor:
                          selectedFilter === 'activeOnly'
                            ? theme.colors.background
                            : theme.colors.surface,
                      }}
                      titleStyle={{
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        color: theme.colors.text,
                      }}
                    />

                    <Menu.Item
                      title="All Servers including deleted"
                      onPress={() => {
                        setSelectedFilter('all');
                        closeMenu();
                      }}
                      style={{
                        backgroundColor:
                          selectedFilter === 'all'
                            ? theme.colors.background
                            : theme.colors.surface,
                      }}
                      titleStyle={{
                        fontSize: 14,
                        fontFamily: 'Poppins',
                        color: theme.colors.text,
                      }}
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
          </BottomSheetView>
        </BottomSheet>
      </View>
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
                fontFamily: 'Poppins-Regular',
                fontSize: 10,
                color: 'black',
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
