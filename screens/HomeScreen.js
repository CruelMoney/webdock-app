import React, {useState, useEffect, useMemo} from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  ActivityIndicator,
  Colors,
  IconButton,
  TextInput,
  Menu,
  useTheme,
  Button,
  ProgressBar,
} from 'react-native-paper';
import {getServers} from '../service/servers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PowerIcon from '../assets/power-icon.svg';
import ArrowIcon from '../assets/arrow-icon.svg';
import EmptyList from '../components/EmptyList';
import ServerItem from '../components/ServerItem';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

const initialLayout = {width: Dimensions.get('window').width};

export function HomeScreen({navigation}) {
  const [servers, setServers] = useState([]);
  const [locations, setLocations] = useState();
  const [profiles, setProfiles] = useState();
  const [images, setImages] = useState();
  const [snapshots, setSnapshots] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  useEffect(() => {
    setAPIBusy(true);
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });
    setTimeout(async () => {
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
          setServers(data.sort(sorter));
          setAPIBusy(false);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, [navigation]);
  const onBackgroundRefresh = async () => {
    setAPIBusy(true);
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

        setServers(data.sort(sorter));
        setAPIBusy(false);
      });
    } catch (e) {
      alert(e);
    }
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
  const onRefresh = async () => {
    setAPIBusy(true);
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServers(userToken).then(data => {
        console.log(data);
        const sorter = (a, b) => {
          var dA = a.date.split(' ');
          var dB = b.date.split(' ');
          var dateA = Date.parse(dA[0] + 'T' + dA[1]),
            dateB = Date.parse(dB[0] + 'T' + dB[1]);

          return dateB - dateA;
        };

        setServers(data.sort(sorter));
        setIsFetching(false);
        setAPIBusy(false);
      });
    } catch (e) {
      alert(e);
    }
  };
  const [isModalVisible, setModalVisible] = useState();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [filteredServers, setFilteredServers] = useState();
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
  const [rerenderFlatList, setRerenderFlatList] = useState(false);
  const [isAPIbusy, setAPIBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const openMenu = () => {
    setVisible(true);
  };
  const closeMenu = () => {
    setVisible(false);
  };
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'All servers'},
    {key: 'second', title: 'Snapshots'},
  ]);
  const openWebView = async url => {
    navigation.navigate('WebViewScreen', {
      uri: url,
      tokenType: 'query',
      token: await AsyncStorage.getItem('userToken'),
    });
  };
  const renderScene = SceneMap({
    first: () => (
      <FlatList
        style={{}}
        data={
          searchQuery
            ? searchQuery.length == 0
              ? servers
              : filteredServers
            : servers
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onRefresh={() => onRefresh()}
        ListEmptyComponent={
          servers ? (
            servers.length === 1 ? (
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
                  onPress={() => openWebView('https://webdock.io/en/pricing')}>
                  Create a Server
                </Button>
              </View>
            ) : null
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
                height: 10,
                width: '100%',
              }}
            />
          </>
        )}
        extraData={rerenderFlatList}
        keyExtractor={item => item.slug}
      />
    ),
    second: () => (
      <FlatList
        style={{}}
        data={
          searchQuery
            ? searchQuery.length == 0
              ? snapshots
              : filteredServers
            : snapshots
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onRefresh={() => onRefresh()}
        ListEmptyComponent={
          snapshots ? (
            snapshots.length == 0 ? (
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
                  You do not have any manual snapshots for your servers yet.
                  Create a manual snapshot for a server and it will show up
                  here.
                </Text>
              </View>
            ) : null
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
                  slug={item.slug}
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
                height: 10,
                width: '100%',
              }}
            />
          </>
        )}
        extraData={rerenderFlatList}
        keyExtractor={item => item.slug}
      />
    ),
  });
  const sortServers = (data, order) => {
    const sorted = [...data].sort((a, b) => {
      if (order === 'desc') {
        return new Date(a.date) - new Date(b.date); // oldest first
      }
      if (order === 'asc') {
        return new Date(b.date) - new Date(a.date); // newest first
      }
      if (order === 'alphabetical') {
        return a.name.localeCompare(b.name); // A–Z
      }
      return 0;
    });

    setServers(sorted);
    closeMenu();
  };

  return (
    <>
      <View
        width="100%"
        height="100%"
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 15,
        }}>
        <View style={{width: '100%'}}>
          <ProgressBar
            indeterminate
            color={theme.colors.primary}
            style={{
              height: 5,
              backgroundColor: '#bcbcbc',
            }}
          />
        </View>
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
              mode="flat" // 'flat' avoids double borders and works better for custom height
              label="Search"
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
              left={<TextInput.Icon icon="magnify" color={theme.colors.text} />}
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
                  padding: 0,
                }}
                icon="swap-vertical"
                size={24}
                iconColor={theme.colors.text}
                onPress={openMenu}
              />
            }>
            <Menu.Item
              key="desc"
              title="Oldest first"
              onPress={() => sortServers(servers, 'desc')}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
            <Menu.Item
              key="asc"
              title="Newest first"
              onPress={() => sortServers(servers, 'asc')}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
            <Menu.Item
              key="alphabetical"
              title="Alphabetical"
              onPress={() => sortServers(servers, 'alphabetical')}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
          </Menu>
        </View>
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={{
                backgroundColor: theme.colors.primary,
              }}
              activeColor={theme.colors.text}
              pressColor={theme.colors.surface}
              inactiveColor="#99A199"
              style={{
                backgroundColor: theme.colors.surface,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                elevation: 0, // Android
                shadowOpacity: 0, // iOS
                borderTopWidth: 0, // Optional: remove top border
              }}
            />
          )}
        />
        {/* {!isAPIbusy ? (
          
        ) : (
          <View
            style={{
              height: '80%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="small" color="#00A1A1" />
          </View>
        )} */}
      </View>
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
  hostname: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  datacenterandprofile: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'normal',
    textAlignVertical: 'center',
  },
  ipv4: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'normal',
    textAlignVertical: 'center',
  },
  fab: {
    backgroundColor: 'red',
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  content1: {
    width: '100%',
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
