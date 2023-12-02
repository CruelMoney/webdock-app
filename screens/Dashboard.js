import React, {useState, useEffect, PureComponent} from 'react';
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
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {getServers, provisionAServer} from '../service/servers';
import {AuthContext} from '../components/context';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
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
import ArrowIcon from '../assets/arrow-icon.svg';
import {getEventsPerPage} from '../service/events';
import EmptyList from '../components/EmptyList';

export function Dashboard({navigation}) {
  const [servers, setServers] = useState();
  const [events, setEvents] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });
    setTimeout(async () => {
      onBackgroundRefresh();
    }, 0);
  }, [navigation]);

  const onBackgroundRefresh = async () => {
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
        setLoading(false);
      });
      getEventsPerPage(userToken, 5).then(data => {
        setEvents(data.slice(0, 3));
        setLoading(false);
      });
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
  class EventItem extends PureComponent {
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
            <View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {renderEventStatusIcon(this.props.item.status)}
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
            {this.props.item.status != 'waiting' &&
            this.props.item.status != 'finished' &&
            this.props.item.status != 'working' ? (
              <ArrowIcon width={15} height={15} />
            ) : null}
          </View>
        </View>
      );
    }
  }
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

  const Item = ({title, alias, dc, profile, ipv4, status}) => (
    <>
      <View style={{backgroundColor: 'white', borderRadius: 10}}>
        <View
          style={{
            display: 'flex',
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {renderStatusIcon(status)}
              <Text style={{fontFamily: 'Raleway-Regular', fontSize: 12}}>
                {' '}
                {title}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Raleway-Light',
                fontSize: 10,
                color: '#8F8F8F',
              }}>
              {profile} · {ipv4}
            </Text>
          </View>
          <ArrowIcon width={15} height={15} />
        </View>
      </View>
    </>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
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
      });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <SafeAreaView
        style={{width: '100%', height: '100%', backgroundColor: '#F4F8F8'}}>
        <View
          width="100%"
          height="100%"
          style={{backgroundColor: '#F4F8F8', padding: '8%'}}>
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
              Overview
            </Text>
            <View style={{width: 28}}></View>
          </View>
          <View style={{height: '50%'}}>
            <View
              style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={{fontFamily: 'Raleway-Medium', fontSize: 18}}>
                Servers
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Servers')}>
                <Text
                  style={{
                    fontFamily: 'Raleway-Regular',
                    fontSize: 10,
                    color: '#747474',
                  }}>
                  All Servers →
                </Text>
              </TouchableOpacity>
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
                style={{marginTop: 10}}
                data={servers}
                scrollEnabled={false}
                // onRefresh={() => onRefresh()}
                // refreshing={isFetching}
                renderItem={({item}) => (
                  <>
                    <TouchableOpacity
                      key={item.slug}
                      onPress={() => {
                        navigation.setParams({
                          slug: item.slug,
                          name: item.name,
                          description: item.description,
                          notes: item.notes,
                          nextActionDate: item.nextActionDate,
                          location: item.location,
                          profile: item.profile,
                        });
                        navigation.navigate('ServerManagement', {
                          slug: item.slug,
                          name: item.name,
                          description: item.description,
                          notes: item.notes,
                          nextActionDate: item.nextActionDate,
                          location: item.location,
                          profile: item.profile,
                        });
                      }}>
                      <View>
                        <Item
                          title={item.name}
                          alias={item.aliases[0]}
                          dc={item.location}
                          profile={item.profile}
                          // profile={profiles.filter(obj => {
                          //   return obj.slug === item.profile}).name}
                          ipv4={item.ipv4}
                          status={item.status}
                        />
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
                contentContainerStyle={
                  servers
                    ? servers.length === 0 && {
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }
                    : {}
                }
                ListEmptyComponent={<EmptyList />}
                keyExtractor={item => item.slug}
              />
            )}
          </View>
          <View style={{height: '50%'}}>
            <View
              style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text style={{fontFamily: 'Raleway-Medium', fontSize: 18}}>
                Events
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Events')}>
                <Text
                  style={{
                    fontFamily: 'Raleway-Regular',
                    fontSize: 10,
                    color: '#747474',
                  }}>
                  All Events →
                </Text>
              </TouchableOpacity>
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
                style={{marginTop: 10}}
                data={events}
                scrollEnabled={false}
                contentContainerStyle={
                  events
                    ? events.length === 0 && {
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }
                    : {}
                }
                // onRefresh={() => onRefresh()}
                // refreshing={isFetching}
                keyExtractor={(item, index) => item.id}
                ListEmptyComponent={<EmptyList />}
                renderItem={({item}) => (
                  <>
                    <TouchableOpacity item={item}>
                      <View>
                        <EventItem item={item} />
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
              />
            )}
          </View>
        </View>
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
});
