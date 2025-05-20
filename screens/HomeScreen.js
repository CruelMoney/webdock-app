import React, {useState, useEffect} from 'react';
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
  PixelRatio,
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
import LoadingList from '../components/LoadingList';
import EmptyList from '../components/EmptyList';
import ServerItem from '../components/ServerItem';
import Spacer from '../components/Spacer';
export function HomeScreen({navigation}) {
  const [servers, setServers] = useState();
  const [locations, setLocations] = useState();
  const [profiles, setProfiles] = useState();
  const [images, setImages] = useState();
  const [snapshots, setSnapshots] = useState();
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

  const Item = ({title, alias, dc, virtualization, profile, ipv4, status}) => (
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
          <View style={{flex: 4}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {renderStatusIcon(status)}
              <Text style={{fontFamily: 'Raleway-Regular', fontSize: 14}}>
                {' '}
                {title}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Raleway-Light',
                fontSize: 12,
                color: '#8F8F8F',
              }}>
              {profile} · {virtualization == 'container' ? 'LXD' : 'KVM'} ·{' '}
              {ipv4}
            </Text>
          </View>
          <ArrowIcon style={{flex: 1}} width={15} height={15} />
        </View>
      </View>
    </>
  );
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
  var currency_symbols = {
    USD: '$', // US Dollar
    EUR: '€', // Euro
    CRC: '₡', // Costa Rican Colón
    GBP: '£', // British Pound Sterling
    ILS: '₪', // Israeli New Sheqel
    INR: '₹', // Indian Rupee
    JPY: '¥', // Japanese Yen
    KRW: '₩', // South Korean Won
    NGN: '₦', // Nigerian Naira
    PHP: '₱', // Philippine Peso
    PLN: 'zł', // Polish Zloty
    PYG: '₲', // Paraguayan Guarani
    THB: '฿', // Thai Baht
    UAH: '₴', // Ukrainian Hryvnia
    VND: '₫', // Vietnamese Dong
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
  return (
    <>
      <View
        width="100%"
        height="100%"
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 38,
            padding: 0,
            margin: 0,
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

          <Spacer size={4} horizontal />

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
                  backgroundColor: theme.colors.surface,
                  borderRadius: 4,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 0,
                }}
                icon="swap-vertical"
                size={20}
                iconColor={theme.colors.text}
                onPress={openMenu}
              />
            }>
            <Menu.Item
              title="Oldest first"
              onPress={() => {}}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
            <Menu.Item
              title="Newest first"
              onPress={() => {}}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
            <Menu.Item
              title="Alphabetical"
              onPress={() => {}}
              titleStyle={{fontSize: 14, fontFamily: 'Poppins'}}
            />
          </Menu>
        </View>

        {!isAPIbusy ? (
          <FlatList
            style={{marginTop: 30}}
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
              servers ? servers.length > 0 ? <EmptyList /> : null : null
            }
            refreshing={isFetching}
            ListFooterComponent={<View style={{height: 60}}></View>}
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
        ) : (
          <View
            style={{
              height: '80%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="small" color="#00A1A1" />
          </View>
        )}
        {/* TODO: next version
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateServer')} //toggleModal
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            right: 20,
            bottom: 20,
            width: 50,
            height: 50,
            borderRadius: 50 / 2,
          }}>
          <PlusIcon height={50} width={50} />
        </TouchableOpacity> */}
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
