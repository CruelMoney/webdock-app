import React, {useState, useEffect, useMemo, useRef} from 'react';
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
import {getServerSnapshots} from '../service/serverSnapshots';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PowerIcon from '../assets/power-icon.svg';
import ArrowIcon from '../assets/arrow-icon.svg';
import EmptyList from '../components/EmptyList';
import ServerItem from '../components/ServerItem';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import CallbackStatusWatcher from '../components/CallbackStatusWatcher';
import SnapshotItem from '../components/SnapshotItem';

const initialLayout = {width: Dimensions.get('window').width};

export function HomeScreen({navigation}) {
  const serversCache = useRef(null);
  const snapshotsCache = useRef(null);
  const sortOrderCache = useRef('desc'); // Default sort order
  const [servers, setServers] = useState([]);
  const [locations, setLocations] = useState();
  const [profiles, setProfiles] = useState();
  const [images, setImages] = useState();
  const [snapshots, setSnapshots] = useState([]);
  const [sortOrder, setSortOrder] = useState(sortOrderCache.current);

  const fetchServers = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      const data = await getServers(userToken);
      // Always sort after fetch
      const sorted = [...data].sort((a, b) => {
        if (sortOrderCache.current === 'desc') {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortOrderCache.current === 'asc') {
          return new Date(a.date) - new Date(b.date);
        }
        if (sortOrderCache.current === 'alphabetical') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
      setServers(sorted);
      serversCache.current = sorted; // Update cache with sorted data
      setIsFetching(false);
      return sorted;
    } catch (e) {
      alert(e);
      setIsFetching(false);
      return [];
    }
  };

  // Fetch servers on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (serversCache.current) {
        // Always apply the cached sort order to the cached servers
        sortServers(serversCache.current, sortOrderCache.current, true);
      } else {
        const data = await fetchServers();
        sortServers(data, sortOrderCache.current, true);
      }
      if (snapshotsCache.current) {
        setSnapshots(snapshotsCache.current);
      } else {
        await fetchSnapshots();
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Fetch snapshots for each server after servers are loaded
  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const allSnapshots = [];

        for (const server of servers) {
          try {
            const allServerSnapshots = await getServerSnapshots(
              userToken,
              server.slug,
            );

            const userSnapshots = allServerSnapshots.filter(
              snap => snap.type === 'user',
            );

            allSnapshots.push(...userSnapshots); // spread each into the array
          } catch (e) {
            console.error(`Failed to fetch snapshots for ${server.slug}:`, e);
          }
        }

        setSnapshots(allSnapshots);
      } catch (e) {
        console.error('Failed to fetch snapshots:', e);
      }
    };

    if (servers.length > 0) {
      fetchSnapshots();
    }
  }, [servers]);

  const onBackgroundRefresh = async () => {
    setIsFetching(true);
    await fetchServers();
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
    setIsFetching(true);
    await fetchServers();
    setIsFetching(false);
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
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  color: theme.colors.primary,
                }}>
                Loading servers...
              </Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onRefresh={() => onRefresh()}
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
                onPress={() => openWebView('https://webdock.io/en/pricing')}>
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
        extraData={rerenderFlatList}
        keyExtractor={item => item.slug}
      />
    ),
    second: () => (
      <FlatList
        style={{}}
        data={snapshots}
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
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: 'Poppins',
                  fontSize: 12,
                  color: theme.colors.primary,
                }}>
                Loading snapshots...
              </Text>
            </View>
          ) : null
        }
        refreshing={isFetching}
        renderItem={({item}) => (
          <>
            <SnapshotItem item={item} />
            <View
              style={{
                height: 1,
                width: '100%',
              }}
            />
          </>
        )}
        extraData={rerenderFlatList}
        keyExtractor={item => item.id}
      />
    ),
  });
  // Update sortServers to allow silent update (no menu close)
  const sortServers = (data, order, silent = false) => {
    const sorted = [...data].sort((a, b) => {
      if (order === 'desc') {
        // Newest first
        return new Date(b.date) - new Date(a.date);
      }
      if (order === 'asc') {
        // Oldest first
        return new Date(a.date) - new Date(b.date);
      }
      if (order === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    setServers(sorted);
    sortOrderCache.current = order; // Update cache
    setSortOrder(order); // Update state
    if (!silent) closeMenu();
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
        <CallbackStatusWatcher
          onFinished={() => {
            console.log('Event completed!');
          }}
        />
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
                search();
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
              left={<TextInput.Icon icon="magnify" color={theme.colors.text} />}
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
              onPress={() => {
                sortOrderCache.current = 'desc';
                sortServers(servers, 'desc');
                setSortOrder('desc');
              }}
              style={{
                backgroundColor:
                  sortOrder === 'desc'
                    ? theme.colors.background
                    : theme.colors.surface,
              }}
              titleStyle={{
                fontSize: 14,
                fontFamily: 'Poppins',
                color:
                  sortOrder === 'desc'
                    ? theme.colors.primary
                    : theme.colors.text,
              }}
            />
            <Menu.Item
              key="asc"
              title="Newest first"
              onPress={() => {
                sortOrderCache.current = 'asc';
                sortServers(servers, 'asc');
                setSortOrder('asc');
              }}
              style={{
                backgroundColor:
                  sortOrder === 'asc'
                    ? theme.colors.background
                    : theme.colors.surface,
              }}
              titleStyle={{
                fontSize: 14,
                fontFamily: 'Poppins',
                color:
                  sortOrder === 'asc'
                    ? theme.colors.primary
                    : theme.colors.text,
              }}
            />
            <Menu.Item
              key="alphabetical"
              title="Alphabetical"
              onPress={() => {
                sortOrderCache.current = 'alphabetical';
                sortServers(servers, 'alphabetical');
                setSortOrder('alphabetical');
              }}
              style={{
                backgroundColor:
                  sortOrder === 'alphabetical'
                    ? theme.colors.background
                    : theme.colors.surface,
              }}
              titleStyle={{
                fontSize: 14,
                fontFamily: 'Poppins',
                color:
                  sortOrder === 'alphabetical'
                    ? theme.colors.primary
                    : theme.colors.text,
              }}
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
