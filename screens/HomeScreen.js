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
import RNPickerSelect from 'react-native-picker-select';
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
export function HomeScreen({navigation}) {
  const [servers, setServers] = useState();
  const [locations, setLocations] = useState();
  const [profiles, setProfiles] = useState();
  const [images, setImages] = useState();
  const [snapshots, setSnapshots] = useState();
  useEffect(() => {
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

          let snaps = [];
          data.map(serveritem => {
            getServerSnapshots(userToken, serveritem.slug).then(itemsnap => {
              itemsnap.map(item => {
                snaps.push({
                  label:
                    serveritem.slug + ' - ' + item.type + ' - ' + item.name,
                  value: item.id,
                });
              });
            });
          });
          setSnapshots(snaps);
        });
        getLocations(userToken).then(data => {
          setLocations(data);
          getProfiles(userToken, newServerLocation).then(datas => {
            datas.map(item => {
              item.isExpanded = false;
            });
            setProfiles(datas);
          });
        });
        getImages(userToken).then(data => {
          let datas = [{label: 'Your own image', value: 'snapshot'}];
          data.map(item => {
            datas.push({label: item.name, value: item.slug});
          });
          setImages(datas);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, [navigation]);
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        console.log('im changing myself');
        userToken = await AsyncStorage.getItem('userToken');
        getProfiles(userToken, newServerLocation).then(datas => {
          datas.map(item => {
            item.isExpanded = false;
          });
          setProfiles([...datas]);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, [newServerLocation]);
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

        setServers(data.sort(sorter));
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

        setServers(data.sort(sorter));
        setIsFetching(false);
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

  const [newServerName, setNewServerName] = useState();
  const [newServerSlug, setNewServerSlug] = useState();
  const [newServerLocation, setNewServerLocation] = useState('ca');
  const [newServerHardware, setNewServerHardware] = useState();
  const [newServerImage, setNewServerImage] = useState();
  const [newServerSnapshot, setNewServerSnapshot] = useState(0);

  const changeLocation = async lc => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getProfiles(userToken, lc).then(datas => {
        datas.map(item => {
          item.isExpanded = false;
        });
        setProfiles([...datas]);
      });
    } catch (e) {
      alert(e);
    }
  };
  const ExpandableComponent = ({item, onClickFunction}) => {
    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
      if (item.isExpanded) {
        setLayoutHeight(null);
        setNewServerHardware(item);
      } else {
        setLayoutHeight(0);
      }
    }, [item.isExpanded]);

    return (
      <>
        <Card
          style={{
            borderColor: item.isExpanded ? '#00a1a1' : '#eee',
            borderWidth: item.isExpanded ? 2 : 1,
            marginVertical: 10,
          }}
          onPress={onClickFunction}>
          <Card.Title
            titleStyle={{color: item.isExpanded ? '#00a1a1' : 'black'}}
            title={item.name}
            right={() => (
              <Title style={{color: '#00a1a1', marginRight: 10}}>
                {currency_symbols[item.price.currency] +
                  item.price.amount / 100 +
                  '/mo'}
              </Title>
            )}
          />
          {item.isExpanded ? <Divider /> : null}
          {item.isExpanded ? (
            <Card.Content style={{height: layoutHeight, overflow: 'hidden'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <SVGCpu height={30} width={30} color="#787878" />
                <Paragraph style={{width: '90%', textAlign: 'center'}}>
                  {item.cpu.cores + ' Cores,' + item.cpu.threads + ' Threads'}
                </Paragraph>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <View>
                  <SVGRam height={30} width={30} color="#787878" />
                </View>
                <Paragraph style={{width: '90%', textAlign: 'center'}}>
                  {Math.round(item.ram * 0.001048576 * 100) / 100 + ' GB RAM'}
                </Paragraph>
              </View>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <SVGStorage height={30} width={30} color="#787878" />
                <Paragraph style={{width: '90%', textAlign: 'center'}}>
                  {Math.round(item.disk * 0.001048576 * 100) / 100 +
                    ' GB On-Board SSD Drive'}
                </Paragraph>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <Icon name="wifi" size={30} color="#787878" />
                <Paragraph style={{width: '90%', textAlign: 'center'}}>
                  1 Gbit/s-Port
                </Paragraph>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingHorizontal: 10,
                }}>
                <Icon name="location-on" size={30} color="#787878" />
                <Paragraph style={{width: '90%', textAlign: 'center'}}>
                  1 dedicated IPv4 address
                </Paragraph>
              </View>
            </Card.Content>
          ) : null}
        </Card>
      </>
    );
  };

  const updateLayout = index => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    const array = [...profiles];
    array.map((value, placeindex) =>
      placeindex === index
        ? (array[placeindex]['isExpanded'] = !array[placeindex]['isExpanded'])
        : (array[placeindex]['isExpanded'] = false),
    );
    setProfiles(array);
  };
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');

    var result = await provisionAServer(
      userToken,
      newServerName,
      newServerSlug,
      newServerLocation,
      newServerHardware.slug,
      newServerImage == 'snapshot' ? null : newServerImage,
      newServerImage == 'snapshot' ? newServerSnapshot : 0,
    );
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server provisioning initiated!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: result.response.message,
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
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
  return (
    <>
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
            Servers
          </Text>
          <View style={{width: 28}}></View>
          {/* <TouchableOpacity onPress={toggleModal}><PlusIcon height={45} width={45}/></TouchableOpacity> */}
        </View>
        <View
          style={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TextInput
            mode="outlined"
            label="Search"
            //value={scriptName}
            onChangeText={searchtext => {
              onChangeSearch(searchtext);
              search();
            }}
            style={{
              flex: 1,
              width: '100%',
              height: 39,
              borderColor: '#00a1a1',
              color: '#00a1a1',
            }}
            selectionColor="#00A1A1"
            dense={true}
            outlineColor="#00A1A1"
            activeOutlineColor="#00A1A1"
            underlineColorAndroid="transparent"
            left={
              <TextInput.Icon
                icon="magnify"
                color="#00a1a1"
                style={{
                  marginBottom: 0,
                }}
              />
            }
            theme={{
              colors: {
                primary: '#00a1a1',
                accent: '#00a1a1',
                text: '#00a1a1',
                placeholder: '#00A1A1',
              },
            }}
          />
          {/* <TouchableOpacity onPress={openMenu}style={{width:'30%'}}><TextInput
            mode="outlined"
            label="Order By"
            style={{height:39,borderColor:'#00a1a1',color:'#00a1a1'}}
            editable={false}
            outlineColor='#00A1A1'
            activeOutlineColor='#00A1A1'
            right={<><TextInput.Icon icon="menu-down" onPress={openMenu} />  <Menu
            visible={visible}
            onDismiss={closeMenu}
            >
            <Menu.Item onPress={() => {}} title="Newest First" />
            <Menu.Item onPress={() => {}} title="Oldest First" />
            <Menu.Item onPress={() => {}} title="Alphabetical" />
          </Menu></>}
            theme={{
              colors: {
                primary: '#00a1a1',
                accent: '#00a1a1',
                text:'#00a1a1',
                placeholder:'#00A1A1'
              },
            }}
          /></TouchableOpacity> */}
        </View>
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
                  <Item
                    title={item.name}
                    alias={item.aliases[0]}
                    dc={item.location}
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
        <TouchableOpacity
          onPress={toggleModal}
          style={{position: 'absolute', right: 30, bottom: 30}}>
          <PlusIcon height={50} width={50} />
        </TouchableOpacity>
      </View>
      <Modal isVisible={isModalVisible} style={{margin: 0}}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
          style={{backgroundColor: 'white', paddingBottom: 20}}>
          <View style={styles.content1}>
            <View style={{width: '100%'}}>
              <View style={{alignItems: 'flex-end'}}>
                <IconButton
                  icon="close"
                  color="black"
                  size={25}
                  onPress={toggleModal}
                />
              </View>

              <Text style={styles.contentTitle}>
                Create a Server in 2 minutes or less
              </Text>
              <Text style={{textAlign: 'center', paddingHorizontal: 20}}>
                It's free to try. We will not charge your card until tomorrow
                morning.
              </Text>
            </View>
            <View style={{padding: 20}}>
              <TextInput
                mode="outlined"
                label="Name"
                value={newServerName}
                onChangeText={newServerName => setNewServerName(newServerName)}
                theme={{
                  colors: {
                    primary: '#00a1a1',
                  },
                }}
              />
              <TextInput
                mode="outlined"
                label="Slug"
                value={newServerSlug}
                onChangeText={newServerSlug => setNewServerSlug(newServerSlug)}
                theme={{
                  colors: {
                    primary: '#00a1a1',
                  },
                }}
                style={{marginTop: 10}}
              />
              <View
                style={{
                  flexDirection: 'row',
                  paddingVertical: 10,
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}>
                {locations
                  ? locations.map(item => (
                      <Card
                        onPress={() => {
                          setNewServerLocation(item.id);
                          changeLocation(item.id);
                        }}
                        key={item.id}
                        style={{
                          borderWidth: 0.1,
                          backgroundColor:
                            item.id === newServerLocation ? '#00a1a1' : 'white',
                        }}>
                        <Card.Content
                          style={{alignItems: 'center', textAlign: 'center'}}>
                          <Title style={{fontSize: 16}}>
                            <Image
                              source={{uri: item.icon}}
                              style={{width: 20, height: 20}}
                            />{' '}
                            {item.name}
                          </Title>
                          <Paragraph>
                            {item.city}/{item.country}
                          </Paragraph>
                        </Card.Content>
                      </Card>
                    ))
                  : null}
              </View>
              {profiles
                ? profiles.map((gr, key) => (
                    <ExpandableComponent
                      key={gr.slug}
                      item={gr}
                      onClickFunction={() => {
                        updateLayout(key);
                      }}
                    />
                  ))
                : null}
              <Text style={styles.titleText}>Image</Text>
              {images ? (
                <RNPickerSelect
                  onValueChange={value => setNewServerImage(value)}
                  items={images}
                  style={{borderColor: 'black'}}
                />
              ) : null}
              {newServerImage === 'snapshot' ? (
                <>
                  <Text>
                    Choose from any existing snapshot or suspended server in
                    your account{' '}
                  </Text>
                  {snapshots ? (
                    <RNPickerSelect
                      onValueChange={value => setNewServerSnapshot(value)}
                      items={snapshots}
                      style={{borderColor: 'black'}}
                    />
                  ) : null}
                </>
              ) : null}
            </View>
            <View
              style={{
                padding: 20,
                width: '100%',
              }}>
              <View style={{justifyContent: 'center'}}>
                <Button
                  mode="contained"
                  theme={{
                    colors: {
                      primary: '#008570',
                    },
                  }}
                  onPress={sendRequest}>
                  Create Server
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
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
