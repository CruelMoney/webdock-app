import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useRef, useMemo} from 'react';
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
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  Snackbar,
  ActivityIndicator,
  Colors,
  useTheme,
  IconButton,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {getServerScripts} from '../service/serverScripts';
import {
  getAllEvents,
  getAllEventsBySlug,
  getEvents,
  getEventsByCallbackId,
} from '../service/events';
import {loadMore} from '../loadMore';
import BackIcon from '../assets/back-icon.svg';
import {PureComponent} from 'react';
import ArrowIcon from '../assets/arrow-icon.svg';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import GradientButton from '../components/GradientButton';
import EmptyList from '../components/EmptyList';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import EventItem from '../components/EventItem';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

let stopFetchMore = true;
const ListFooterComponent = () => (
  <Text
    style={{
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 5,
    }}>
    Loading...
  </Text>
);

export default function ServerEvents({route, navigation}) {
  const [serverEvents, setEvents] = useState([]);
  const [eventsUpdated, setEventsUpdated] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const callbackId = route.params?.callbackId;
    const slug = route.params?.slug;

    let pollingInterval = null;

    const fetchEvents = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');

        if (callbackId) {
          const data = await getEventsByCallbackId(userToken, callbackId);
          setEvents(data);
          setIsLoading(false);

          // Start polling
          pollingInterval = setInterval(async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              const refreshed = await getEventsByCallbackId(token, callbackId);
              setEvents(refreshed);

              const stillWaiting = refreshed.some(
                obj => obj.status === 'waiting' || obj.status === 'working',
              );

              if (!stillWaiting) {
                clearInterval(pollingInterval);
              }
            } catch (e) {
              console.error('Polling error:', e);
            }
          }, 1500);
        } else {
          const data = await getAllEventsBySlug(userToken, slug);
          setEvents(data);
          setIsLoading(false);
        }
      } catch (e) {
        alert('Something went wrong.');
      }
    };

    fetchEvents();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });

    return () => {
      unsubscribe();
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [route]);

  class Item extends PureComponent {
    render() {
      return (
        <View style={{backgroundColor: 'white', borderRadius: 10}}>
          <View
            style={{
              display: 'flex',
              padding: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexGrow: 1}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {renderStatusIcon(this.props.item.status)}
                <Text
                  style={{
                    marginStart: 5,
                    width: 100,
                    includeFontPadding: false,
                    fontFamily: 'Raleway-Regular',
                    fontSize: 14,
                  }}>
                  {this.props.item.serverSlug}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Raleway-Light',
                    fontSize: 12,
                    includeFontPadding: false,
                    color: '#8F8F8F',
                  }}>
                  {this.props.item.startTime}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Raleway-Light',
                  fontSize: 12,
                  includeFontPadding: false,
                  color: '#8F8F8F',
                }}>
                {this.props.item.action}
              </Text>
            </View>
            <View style={{flexGrow: 0}}>
              {this.props.item.status != 'waiting' &&
              this.props.item.status != 'finished' &&
              this.props.item.status != 'working' ? (
                <TouchableOpacity
                  onPress={() => {
                    setEventDetailsModal(true);
                    setEventDetails(this.props.item);
                  }}>
                  <ArrowIcon width={15} height={15} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      );
    }
  }

  const renderStatusIcon = icon => {
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

  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      if (route.params?.callbackId) {
        getEventsByCallbackId(userToken, route.params.callbackId).then(data => {
          setEvents(data);
          setIsFetching(false);
        });
      } else {
        getAllEventsBySlug(userToken, route.params.slug).then(data => {
          setEvents(data);
          setIsFetching(false);
        });
      }
    } catch (e) {
      alert(e);
    }
  };
  const loadMoreItems = async () => {
    setLoadingMore(true);
    if (!stopFetchMore) {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAllEvents(userToken).then(data => {
          setEvents(data);
          setIsLoading(false);
          stopFetchMore = true;
        });
      } catch (e) {
        alert(e);
      }
      setLoadingMore(false);
    }
  };
  const [eventDetailsModal, setEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);
  const theme = useTheme();

  const openSheet = event => {
    setEventDetails(event);
    setEventDetailsModal(true);
  };
  return (
    <>
      <BottomSheetWrapper title="Events" onClose={() => navigation.goBack()}>
        <View
          width="100%"
          height="100%"
          style={{
            minHeight: '100%',
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              height: 44,
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
              Server events
            </Text>
          </View>
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={serverEvents}
            scrollEnabled={false}
            removeClippedSubviews={true}
            onRefresh={() => onRefresh()}
            refreshing={isFetching}
            renderItem={({item}) => (
              <View key={item.id}>
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
                <View
                  style={{
                    height: 1,
                  }}></View>
              </View>
            )}
            ListEmptyComponent={
              serverEvents ? (
                serverEvents.length === 0 ? (
                  <View
                    style={{
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                      padding: 14,
                      backgroundColor: theme.colors.surface,
                    }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontFamily: 'Poppins',
                        fontSize: 14,
                      }}>
                      No events have been triggered yet ...
                    </Text>
                  </View>
                ) : null
              ) : null
            }
            keyExtractor={item => item.id}
          />
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
              backgroundColor: '#022213',
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
                fontFamily: 'Poppins',
                fontSize: 12,
                borderColor: '#000000',
                borderStyle: 'dashed',
                borderWidth: 1,
                borderRadius: 4,
                padding: 16,
                color: 'black',
              }}>
              {eventDetails.message ?? 'No event message provided'}
            </Text>
            <Button
              mode="contained"
              textColor="black"
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
  icon: {
    width: '10%',
  },
  name: {
    width: '80%',
  },
  status: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    backgroundColor: 'red',
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
