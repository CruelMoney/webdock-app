import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {
  Avatar,
  Divider,
  Portal,
  Text,
  Button,
  Provider,
  ProgressBar,
  Colors,
  ActivityIndicator,
} from 'react-native-paper';
import Modal from 'react-native-modal';
import ArrowIcon from '../assets/arrow-icon.svg';
import {getEvents} from '../service/events';
import AsyncStorage from '@react-native-community/async-storage';
import MenuIcon from '../assets/menu-icon.svg';
import {PureComponent} from 'react';

let stopFetchMore = true;

export function EventsScreen({navigation}) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eventDetailsModal, setEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken, 1).then(data => {
          setPage(page + 1);
          setEvents(events.concat(data));
          setIsLoading(false);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);
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
            <View style={{width: '90%'}}>
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
                    fontFamily: 'Raleway-Regular',
                    fontSize: 12,
                  }}>
                  {this.props.item.serverSlug}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Raleway-Light',
                    fontSize: 10,
                    color: '#8F8F8F',
                  }}>
                  {this.props.item.startTime}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Raleway-Light',
                  fontSize: 10,
                  color: '#8F8F8F',
                }}>
                {this.props.item.action}
              </Text>
            </View>
            <View>
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
  const [page, setPage] = useState(1);
  const loadMoreItems = async () => {
    setLoadingMore(true);
    if (!stopFetchMore) {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken, page + 1).then(data => {
          setPage(page + 1);
          setEvents(events.concat(data));
          setIsLoading(false);
          stopFetchMore = true;
        });
      } catch (e) {
        alert(e);
      }
      setLoadingMore(false);
    }
  };

  const renderLoader = () => {
    return loadingMore ? (
      <View style={styles.loaderStyle}>
        <ActivityIndicator size="medium" color="#00a1a1" />
      </View>
    ) : null;
  };

  return (
    <>
      {events == [] ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="medium" color="#00a1a1" />
        </div>
      ) : (
        <View
          width="100%"
          height="100%"
          style={{
            backgroundColor: '#F4F8F8',
            paddingTop: '8%',
            paddingHorizontal: '8%',
          }}>
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
                textAlign: 'center',
              }}>
              Events
            </Text>
            <View style={{width: 50}}></View>
          </View>
          <FlatList
            data={events}
            style={{marginTop: 30}}
            initialNumToRender={10}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <>
                <TouchableOpacity item={item}>
                  <View>
                    <Item item={item} />
                  </View>
                </TouchableOpacity>
                <View
                  style={{
                    height: 10,
                    width: '100%',
                  }}
                />
              </>
            )}
            keyExtractor={item => item.id}
            ListFooterComponent={renderLoader}
            onEndReached={loadMoreItems}
            onEndReachedThreshold={0.5}
            onScrollBeginDrag={() => {
              stopFetchMore = false;
            }}
            // ListFooterComponent={() => loadingMore && <ListFooterComponent />}
          />
          {/* Alias domains Modal */}
        </View>
      )}
      <Modal
        testID={'modal'}
        isVisible={eventDetailsModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setEventDetailsModal(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 30,
            borderTopStartRadius: 10,
            borderTopEndRadius: 10,
          }}>
          <Text
            style={{
              fontFamily: 'Raleway-Medium',
              fontSize: 18,
              color: '#00a1a1',
              marginVertical: 10,
            }}>
            Error details
          </Text>
          <Text style={{fontFamily: 'Raleway-Regular', fontSize: 12}}>
            We are sorry but we could not complete your command. In most cases
            an Administrator has already been notified. In some cases you can
            figure out what went wrong and fix it yourself by looking at the
            command output below.
          </Text>
          <View
            style={{
              borderColor: '#AEAEAE',
              borderStyle: 'dashed',
              borderWidth: 1,
              borderRadius: 4,
              padding: 20,
              marginVertical: 15,
            }}>
            <Text style={{fontFamily: 'Raleway-Regular', fontSize: 10}}>
              {eventDetails.message}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              marginVertical: 15,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{width: '100%'}}
              onPress={() => setEventDetailsModal(false)}>
              <LinearGradient
                locations={[0.29, 0.8]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={['#00A1A1', '#03A84E']}
                style={{borderRadius: 5}}>
                <Text
                  style={{
                    padding: 15,
                    fontFamily: 'Raleway-Bold',
                    fontSize: 18,
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  Okay, thanks
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
  serveranddate: {
    width: '20%',
    alignItems: 'center',
  },
  loaderStyle: {
    marginVertical: 16,
    alignItems: 'center',
  },
  midinfo: {
    width: '65%',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: '5%',
    justifyContent: 'center', //Centered vertically
    flex: 1,
  },
  status: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventname: {
    fontSize: 12,
    textAlign: 'center',
  },
});
