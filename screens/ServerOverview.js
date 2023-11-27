import AsyncStorage from '@react-native-community/async-storage';
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  TouchableOpacity,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Card,
  Provider,
  Title,
  Menu,
  Button,
  Divider,
  TextInput,
  IconButton,
  Paragraph,
  DataTable,
  Checkbox,
  Colors,
  Snackbar,
  Badge,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  dryRunForServerProfileChange,
  rebootServer,
  startServer,
  stopServer,
  suspendServer,
  changeServerProfile,
  reinstallServer,
} from '../service/serverActions';
import {
  getImages,
  getLocations,
  getProfiles,
} from '../service/serverConfiguration';
import {getServerBySlug} from '../service/servers';
import Modal from 'react-native-modal';
import {SvgUri, SvgXml} from 'react-native-svg';
import SVGCpu from '../assets/icon-cpu.svg';
import SVGRam from '../assets/icon-ram2.svg';
import SVGStorage from '../assets/icon-storage.svg';
import IconOcticons from 'react-native-vector-icons/Octicons';
import {FlatList} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
import MenuIcon from '../assets/menu-icon.svg';
import UserIcon from '../assets/user-icon.svg';
import PubicKeyIcon from '../assets/public-key-icon.svg';
import ScriptsIcon from '../assets/scripts-icon.svg';
import TeamIcon from '../assets/team-icon.svg';
import ActivityIcon from '../assets/activity-icon.svg';
import EventsIcon from '../assets/events-icon.svg';
import SnapshotIcon from '../assets/snapshot-icon.svg';
import UsersIcon from '../assets/users-icon.svg';
import MoreIcon from '../assets/more-icon.svg';
import LinkIcon from '../assets/link-icon.svg';
import UtilizationIcon from '../assets/utilization-icon.svg';
import {getEventsByCallbackId} from '../service/events';
import LinearGradient from 'react-native-linear-gradient';
import EditIcon from '../assets/edit-icon.svg';
import GradientButton from '../components/GradientButton';
import {Picker} from '@react-native-picker/picker';
import {LoginWebView} from './LoginWebView';

export default function ServerOverview({route, navigation}) {
  const [visible, setVisible] = React.useState(false);
  const [dryRun, setDryRun] = React.useState();
  const [server, setServer] = React.useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerBySlug(userToken, route.params.slug).then(data => {
          setServer(data);
          getAllProfiles(data.location);
        });
        getAllLocations();
        getAllImages();
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerBySlug(userToken, route.params.slug).then(data => {
        setServer(data);
        getAllProfiles(data.location);
      });
      getAllLocations();
      getAllImages();
    } catch (e) {
      alert(e);
    }
  };

  const startThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var result = await startServer(userToken, slug);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setStartModal(false);
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Server start initiated!',
        //   visibilityTime: 2000,
        //   autoHide: true,
        // });
        setCallbackId(result.headers.get('x-callback-id'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        setStartModal(false);
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
    } else if (result.status == 404) {
      try {
        setStartModal(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const stopThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var result = await stopServer(userToken, slug);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setStopModal(false);
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Server shutdown initiated!',
        //   visibilityTime: 4000,
        //   autoHide: true,
        // });
        setCallbackId(result.headers.get('X-Callback-ID'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        setStopModal(false);
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
    } else if (result.status == 404) {
      try {
        setStopModal(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };

  const rebootThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');
    var result = await rebootServer(userToken, slug);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setRestartModal(false);
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Server shutdown initiated!',
        //   visibilityTime: 4000,
        //   autoHide: true,
        // });
        setCallbackId(result.headers.get('X-Callback-ID'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        setRestartModal(false);
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
    } else if (result.status == 404) {
      try {
        setRestartModal(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };

  const suspendThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var result = await suspendServer(userToken, slug);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setSuspendModal(false);
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Server suspend initiated!',
        //   visibilityTime: 4000,
        //   autoHide: true,
        // });
        setCallbackId(result.headers.get('X-Callback-ID'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        setSuspendModal(false);
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
    } else if (result.status == 404) {
      try {
        setSuspendModal(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const reinstallThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var result = await reinstallServer(
      userToken,
      slug,
      selectedImageForReinstall,
    );
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setReinstallModal(false);
        // Toast.show({
        //   type: 'success',
        //   position: 'bottom',
        //   text1: 'Server suspend initiated!',
        //   visibilityTime: 4000,
        //   autoHide: true,
        // });
        setCallbackId(result.headers.get('X-Callback-ID'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        setReinstallModal(false);
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
    } else if (result.status == 404) {
      try {
        setReinstallModal(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const [locations, setLocations] = React.useState();
  const getAllLocations = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getLocations(userToken).then(data => {
        setLocations(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [images, setImages] = React.useState();
  const getAllImages = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getImages(userToken).then(data => {
        console.log(data);
        setImages(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [profiles, setProfiles] = React.useState([]);
  const getAllProfiles = async lc => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getProfiles(userToken, lc).then(data => {
        data.map(item => {
          item.isExpanded = false;
        });
        setProfiles(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const getLocationIcon = serverlocation => {
    locations
      ? locations.map(gr => {
          if (serverlocation == gr.id) {
            return gr.icon;
          }
        })
      : '';
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
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [selectedPlan, setSelectedPlan] = useState();

  const ExpandableComponent = ({item, onClickFunction}) => {
    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
      if (item.isExpanded) {
        setLayoutHeight(null);
        setSelectedPlan(item);
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
  const [itemsCharge, setItemsCharge] = useState();
  useEffect(() => {
    if (selectedPlan != null) {
      setTimeout(async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          dryRunForServerProfileChange(
            userToken,
            route.params.slug,
            selectedPlan.slug,
          ).then(data => {
            if (selectedPlan.slug != server.slug) {
              setDryRun(data);
              setItemsCharge([...data.response.chargeSummary.items]);
            }
          });
        } catch (e) {
          alert(e);
        }
      }, 0);
    }
  }, [selectedPlan]);

  const [checkedBox, setCheckedBox] = useState(false);

  const changeProfile = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await changeServerProfile(
      userToken,
      route.params.slug,
      selectedPlan.slug,
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server Profile Change initiated',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
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
    } else if (result.status == 404) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const openUrl = async alias => {
    if (alias != null) {
      if (alias.includes('http://') || alias.includes('https://')) {
        //
      } else {
        alias = 'http://' + alias;
      }
    }
    const supported = await Linking.canOpenURL(alias);

    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(alias);
    } else {
      Alert.alert(`Don't know how to open this URL: ${alias}`);
    }
  };
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false);
  const openAlertDialog = () => {
    setIsAliasModalOpen(!isAliasModalOpen);
  };
  const renderStatusIcon = icon => {
    if (icon == 'running') {
      return (
        <>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="done" size={25} color="#4C9F5A" />
          </View>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              marginLeft: 10,
              fontSize: 12,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'stopped') {
      return (
        <>
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="power-settings-new" size={25} color="#E15241" />
          </View>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              marginLeft: 10,
              fontSize: 12,
              color: '#E15241',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'waiting') {
      return (
        <>
          <ActivityIndicator
            animating={true}
            size={25}
            color={Colors.blue400}
          />
          ;
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              marginLeft: 10,
              fontSize: 12,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'working') {
      return (
        <>
          <ActivityIndicator
            animating={true}
            size={25}
            color={Colors.blue400}
          />
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              marginLeft: 10,
              fontSize: 12,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (
      icon == 'provisioning' ||
      icon == 'rebooting' ||
      icon == 'starting' ||
      icon == 'stopping' ||
      icon == 'reinstalling'
    ) {
      return (
        <>
          <ActivityIndicator
            animating={true}
            size={25}
            color={Colors.blue400}
          />
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              marginLeft: 10,
              fontSize: 12,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    }
    return null;
  };
  const handleClick = url => {
    if (!url.includes('https://') && !url.includes('http://')) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  const tabs = [
    {
      label: 'Activity',
      icon: <ActivityIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Activity',
    },
    {
      label: 'Events',
      icon: <EventsIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Events',
    },
    // {
    //   label: 'Utilization',
    //   icon: <UtilizationIcon width={19} height={19} color="#00a1a1" />,
    //   navigate: 'Utilization',
    // },
    {
      label: 'Snapshots',
      icon: <SnapshotIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Snapshots',
    },
    {
      label: 'Shell users',
      icon: <UsersIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Shell Users',
    },
    {
      label: 'Scripts',
      icon: <ScriptsIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Scripts',
    },
  ];

  const [startModal, setStartModal] = useState(false);
  const [restartModal, setRestartModal] = useState(false);
  const [stopModal, setStopModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [reinstallModal, setReinstallModal] = useState(false);
  const [aliasModal, setAliasModal] = useState(false);
  const [callbackId, setCallbackId] = useState();
  const [selectedImageForReinstall, setSelectedImageForReinstall] = useState();

  const [visibleSnack, setVisibleSnack] = React.useState(false);

  const onToggleSnackBar = () => setVisibleSnack(!visibleSnack);

  const onDismissSnackBar = () => setVisibleSnack(false);
  const handleOnchange = (itemValue, item) => {
    setSelectedImageForReinstall(itemValue);
  };

  return server ? (
    <>
      <View
        width="100%"
        height="100%"
        style={{
          backgroundColor: '#F4F8F8',
          paddingHorizontal: '8%',
          paddingTop: '8%',
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={navigation.goBack}>
            <BackIcon height={45} width={50} />
          </TouchableOpacity>
          <Text
            style={{
              color: '#00A1A1',
              fontFamily: 'Raleway-Medium',
              fontSize: 20,
              textAlign: 'center',
            }}>
            {route.params.name.length > 10
              ? route.params.name.slice(0, 10 - 1) + ' ...'
              : route.params.name}
          </Text>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            style={{
              shadowOpacity: 0.1,
            }}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <MoreIcon height={45} width={50} />
              </TouchableOpacity>
            }>
            {/* <Menu.Item
              icon="pencil"
              onPress={() => {
                navigation.navigate('UpdateServerMetadata');
              }}
              title="EDIT METADATA"
            /> */}
            <Menu.Item
              icon={({color, size}) => (
                <Icon
                  name="pause"
                  color={'#ffb242'} // replace with your desired color
                  size={size}
                />
              )}
              onPress={() => {
                setSuspendModal(true);
              }}
              title="ARCHIVE SERVER"
            />
            <Menu.Item
              icon={({color, size}) => (
                <Icon
                  name="autorenew"
                  color={'#449ADF'} // replace with your desired color
                  size={size}
                />
              )}
              onPress={() => {
                setReinstallModal(true);
              }}
              title="REINSTALL SERVER"
            />
            {/* <Divider /> */}
            {/* <Menu.Item
              icon={({color, size}) => (
                <Icon
                  name="delete"
                  color={'#D94B4B'} // replace with your desired color
                  size={size}
                />
              )}
              onPress={() => {
                deleteThisServer(server.slug);
              }}
              title="DELETE SERVER"
            /> */}
          </Menu>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                marginTop: 15,
                width: '40%',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 4,
                padding: 10,
              }}>
              {renderStatusIcon(server.status)}
            </View>
            <TouchableOpacity
              onPress={() => setStartModal(true)}
              style={{
                width: '29%',
                alignItems: 'center',
                flexDirection: 'row',
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 10,
                marginTop: 15,
                display: server.status == 'running' ? 'none' : 'flex',
              }}>
              <View
                style={{
                  height: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(76,159,90,0.26)',
                    borderRadius: 20 / 2,
                  }}>
                  <Icon
                    name="play-arrow"
                    size={15}
                    color="#4C9F5A"
                    onPress={() => setStartModal(true)}
                  />
                </View>
              </View>
              <Text
                style={{
                  marginStart: 5,
                  includeFontPadding: false,
                  textAlign: 'center',
                  fontFamily: 'Raleway-SemiBold',
                  fontSize: 10,
                  color: '#4C9F5A',
                }}>
                Start
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStopModal(true)}
              style={{
                width: '29%',
                alignItems: 'center',
                flexDirection: 'row',
                display: server.status == 'running' ? 'flex' : 'none',
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 10,
                marginTop: 15,
              }}>
              <View
                style={{
                  height: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(217,75,75,0.26)',
                    borderRadius: 20 / 2,
                  }}>
                  <Icon
                    name="stop"
                    size={15}
                    color="#E15241"
                    onPress={() => setStopModal(true)}
                  />
                </View>
              </View>
              <Text
                style={{
                  marginStart: 5,
                  fontFamily: 'Raleway-SemiBold',
                  fontSize: 10,
                  color: '#E15241',
                }}>
                Stop
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRestartModal(true)}
              style={{
                width: '29%',
                alignItems: 'center',
                flexDirection: 'row',
                display: server.status == 'running' ? 'flex' : 'none',
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 10,
                marginTop: 15,
              }}>
              <View
                style={{
                  height: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(3,155,229,0.26)',
                    borderRadius: 20 / 2,
                  }}>
                  <Icon
                    name="replay"
                    size={15}
                    color="#449ADF"
                    onPress={() => setRestartModal(true)}
                  />
                </View>
              </View>
              <Text
                style={{
                  marginStart: 5,
                  fontFamily: 'Raleway-SemiBold',
                  fontSize: 10,
                  color: '#449ADF',
                }}>
                Restart
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 15,
                backgroundColor: 'white',
                borderRadius: 10,
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
              }}>
              <View
                style={{
                  display: 'flex',
                  width: '90%',
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                    Name
                  </Text>
                  <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                    {server.name}
                  </Text>
                </View>
              </View>
              <View
                style={{display: 'flex', flexDirection: 'row', width: '10%'}}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UpdateServerMetadata')}>
                  <EditIcon width={25} height={25} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View>
            <View
              style={{marginTop: 1, backgroundColor: 'white', borderRadius: 0}}>
              <View
                style={{
                  display: 'flex',
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                {server.aliases ? (
                  <View>
                    <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                      Alias
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {server.aliases.length == 1 ? (
                        <>
                          <TouchableOpacity
                            style={{flexDirection: 'row', alignItems: 'center'}}
                            onPress={() => handleClick(server.aliases[0])}>
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,161,161,0.26)',
                                borderRadius: 15 / 2,
                              }}>
                              <LinkIcon width={8} height={8} />
                            </View>
                            <Text
                              style={{
                                fontFamily: 'Raleway-Light',
                                fontSize: 12,
                                marginStart: 5,
                              }}>
                              {server.aliases[0]}
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <Text
                          style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                          {server.aliases[0]}
                        </Text>
                      )}
                    </View>
                    {server.aliases.length > 1 ? (
                      <TouchableOpacity
                        style={{marginTop: 10}}
                        onPress={() => setAliasModal(true)}>
                        <Text
                          style={{
                            fontFamily: 'Raleway-Regular',
                            fontSize: 10,
                            color: '#00A1A1',
                          }}>
                          See {server.aliases.length - 1} more
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <View>
            <View
              style={{
                marginTop: 1,
                backgroundColor: 'white',
              }}>
              <View
                style={{
                  display: 'flex',
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                    Location
                  </Text>
                  {locations
                    ? locations
                        .filter(item => server.location === item.id)
                        .map(item => {
                          return (
                            <View
                              key={item.id}
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 10,
                              }}>
                              <Image
                                source={{uri: item.icon}}
                                style={{width: 20, height: 20}}
                              />
                              <Text
                                style={{
                                  fontFamily: 'Raleway-Light',
                                  fontSize: 12,
                                  includeFontPadding: false,
                                  marginLeft: 5,
                                }}>
                                {item.name + ' / ' + item.city}
                              </Text>
                            </View>
                          );
                        })
                    : null}
                </View>
              </View>
            </View>
          </View>
          <View>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                marginTop: 1,
                backgroundColor: 'white',
              }}>
              <View
                style={{
                  display: 'flex',
                  width: '90%',
                  padding: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                    Profile
                  </Text>
                  <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                    {'[' +
                      (server.virtualization === 'container' ? 'LXD' : 'KVM') +
                      '] '}
                    {profiles
                      ? profiles
                          .filter(item => server.profile === item.slug)
                          .map(item => {
                            return item.name;
                          })
                      : null}
                  </Text>
                </View>
              </View>
              <View
                style={{display: 'flex', flexDirection: 'row', width: '10%'}}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ChangeProfile', {
                      location: server.location,
                      profile: profiles.filter(
                        item => server.profile === item.slug,
                      )[0].slug,
                    })
                  }>
                  <EditIcon width={25} height={25} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View>
            <View
              style={{marginTop: 1, backgroundColor: 'white', borderRadius: 0}}>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(server.ipv4);
                  Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'IPv4 is successfully copied to clipboard',
                    visibilityTime: 4000,
                    autoHide: true,
                  });
                }}>
                <View
                  style={{
                    display: 'flex',
                    padding: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                      IPv4
                    </Text>
                    <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                      {server.ipv4}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <View
              style={{
                marginTop: 1,
                backgroundColor: 'white',
                borderRadius: 10,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }}>
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(server.ipv6);
                  Toast.show({
                    type: 'success',
                    position: 'bottom',
                    text1: 'IPv6 is successfully copied to clipboard',
                    visibilityTime: 4000,
                    autoHide: true,
                  });
                }}>
                <View
                  style={{
                    display: 'flex',
                    padding: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                      IPv6
                    </Text>
                    <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                      {server.ipv6}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <Text
            style={{
              fontFamily: 'Raleway-Medium',
              fontSize: 18,
              marginVertical: 10,
            }}>
            Server info
          </Text>
          <View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              {tabs.map(item => (
                <View
                  key={item.label}
                  style={{
                    width: '48%',
                    marginBottom: 10,
                    backgroundColor: 'rgba(0, 161, 161, 0.06)',
                    borderRadius: 10,
                  }}>
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => navigation.navigate(item.navigate)}>
                    <View style={{height: 125}}>
                      <View style={{display: 'flex'}}>
                        <View
                          style={{
                            height: 125 / 2,
                            padding: 10,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-end',
                          }}>
                          <View
                            style={{
                              width: 33,
                              height: 33,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: 'white',
                              borderRadius: 33 / 2,
                              opacity: 0.66,
                            }}>
                            {item.icon}
                          </View>
                        </View>
                        <View
                          style={{
                            height: 125 / 2,
                            padding: 10,
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Raleway-Bold',
                              fontSize: 18,
                              marginStart: 5,
                              marginBottom: 5,
                              color: '#00a1a1',
                            }}>
                            {item.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          <View style={{width: '100%', height: 20}}></View>
        </ScrollView>
      </View>
      {/* {ChangeProfile} */}
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
              <View style={styles.closebutton}>
                <IconButton
                  icon="close"
                  color="black"
                  size={25}
                  onPress={toggleModal}
                />
              </View>

              <Text style={styles.contentTitle}>
                Your Current Server Profile
              </Text>
            </View>
            <View style={{padding: 20}}>
              {profiles
                ? profiles.map((gr, key) =>
                    server.profile == gr.slug ? (
                      <ExpandableComponent
                        key={gr.slug}
                        item={gr}
                        onClickFunction={() => {
                          updateLayout(key);
                        }}
                      />
                    ) : null,
                  )
                : null}
              <Text style={styles.contentTitle}>
                Select a New Hardware Profile
              </Text>
              {profiles
                ? profiles.map((gr, key) =>
                    server.profile != gr.slug ? (
                      <ExpandableComponent
                        key={gr.slug}
                        item={gr}
                        onClickFunction={() => {
                          updateLayout(key);
                        }}
                      />
                    ) : null,
                  )
                : null}
              {itemsCharge && selectedPlan ? (
                selectedPlan.slug != server.profile ? (
                  <View>
                    <Text style={styles.contentTitle}>Summary</Text>

                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title>
                          Name - Profile - Period
                        </DataTable.Title>
                        <DataTable.Title numeric>Price</DataTable.Title>
                      </DataTable.Header>

                      {itemsCharge
                        ? itemsCharge.map(item => (
                            <DataTable.Row key={item.text}>
                              <DataTable.Cell>{item.text}</DataTable.Cell>
                              <DataTable.Cell numeric>
                                {item.price.amount / 100 +
                                  ' ' +
                                  currency_symbols[item.price.currency]}
                              </DataTable.Cell>
                            </DataTable.Row>
                          ))
                        : null}
                    </DataTable>
                    <DataTable style={{width: '50%', alignSelf: 'flex-end'}}>
                      <DataTable.Row>
                        <DataTable.Cell>Subtotal</DataTable.Cell>
                        <DataTable.Cell numeric>
                          {dryRun.response.chargeSummary.total.subTotal.amount /
                            100 +
                            ' ' +
                            currency_symbols[
                              dryRun.response.chargeSummary.total.subTotal
                                .currency
                            ]}
                        </DataTable.Cell>
                      </DataTable.Row>
                      <DataTable.Row>
                        <DataTable.Cell>VAT</DataTable.Cell>
                        <DataTable.Cell numeric>
                          {dryRun.response.chargeSummary.total.vat.amount /
                            100 +
                            ' ' +
                            currency_symbols[
                              dryRun.response.chargeSummary.total.vat.currency
                            ]}
                        </DataTable.Cell>
                      </DataTable.Row>
                      <DataTable.Row style={{borderColor: 'red'}}>
                        <DataTable.Cell>
                          <Text style={{fontWeight: 'bold'}}>Pay now</Text>
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={{fontWeight: 'bold'}}>
                            {dryRun.response.chargeSummary.total.total.amount /
                              100 +
                              ' ' +
                              currency_symbols[
                                dryRun.response.chargeSummary.total.total
                                  .currency
                              ]}
                          </Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    </DataTable>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: 20,
                        paddingRight: 20,
                      }}>
                      <Checkbox
                        status={checkedBox ? 'checked' : 'unchecked'}
                        onPress={() => {
                          setCheckedBox(!checkedBox);
                        }}
                      />
                      <Text>
                        I accept the above changes to my server and order in
                        obligation.
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text>
                    Please select a new hardware profile above in order to see a
                    summary of changes.
                  </Text>
                )
              ) : null}
            </View>
            <View style={{padding: 20}}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Button
                  mode="contained"
                  disabled={!checkedBox}
                  icon="send"
                  style={{width: '100%'}}
                  theme={{
                    colors: {
                      primary: '#008570',
                    },
                  }}
                  onPress={changeProfile}>
                  Change Profile
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
      {/* Start Server Modal */}
      <Modal
        testID={'modal'}
        isVisible={startModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setStartModal(false)}
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
            Start server
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Do you really want to start this server?
          </Text>
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
              onPress={() => setStartModal(false)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#D94B4B',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => startThisServer(route.params.slug)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#4C9F5A',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Start
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Stop Server Modal */}
      <Modal
        testID={'modal'}
        isVisible={stopModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setStopModal(false)}
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
            Stop server
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Do you really want to stop this server?
          </Text>
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
              onPress={() => setStopModal(false)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#00a1a1',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => stopThisServer(route.params.slug)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#D94B4B',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Stop
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Reboot Server Modal */}
      <Modal
        testID={'modal'}
        isVisible={restartModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setRestartModal(false)}
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
            Reboot server
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Do you really want to reboot this server?
          </Text>
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
              onPress={() => setRestartModal(false)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#00A1A1',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => rebootThisServer(route.params.slug)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#449ADF',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Reboot
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Suspend Server Modal */}
      <Modal
        testID={'modal'}
        isVisible={suspendModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setSuspendModal(false)}
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
            Archive {route.params.slug}
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Do you really want to suspend this server?
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#000000',
                marginStart: 10,
              }}>
              This will create a new Snapshot of your server which will be put
              into cold storage. This enables you to restore this server in the
              future. Your passwords and settings will not be deleted, and your
              server shortname (slug) will be reserved. Statistics and
              monitoring rules will be deleted.
            </Text>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#000000',
                marginStart: 10,
              }}>
              You can only have up to 3 archived servers at any one time. If you
              want more, click here to view current pricing. You can permanently
              delete archived servers in your servers overview. You do not pay
              for the first 3 archived servers in your account.
            </Text>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#f44336', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#000000',
                marginStart: 10,
              }}>
              Warning: Archiving a server means that you are in effect removing
              it from the Webdock infrastructure and freeing up your IPv4
              address for others to use.
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
              onPress={() => setSuspendModal(false)}
              style={{
                width: '45%',
                height: 40,
                borderColor: '#00956c',
                borderWidth: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#00956c',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => suspendThisServer(route.params.slug)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#df0000',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Archive
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Reinstall Server Modal */}
      <Modal
        testID={'modal'}
        isVisible={reinstallModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => reinstallModal(false)}
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
            Reinstall {route.params.slug}
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#000000',
                marginStart: 10,
              }}>
              Here you can re-install your server. This essentially means you
              will be deleting your server and replacing it with a fresh image
              of your choice. You will keep your server name and metadata,
              server shortname (slug), monitoring rules and IP addresses.
              Otherwise it will behave as a freshly provisioned server.
            </Text>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#ffeb3b', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#000000',
                marginStart: 10,
              }}>
              If you install a LAMP/LEMP stack Webdock will generate new
              credentials for your server (Database, FTP and admin Shell/SSH
              user).
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Please select an image to install
          </Text>
          <View>
            <Picker
              selectedValue={'sadsad0'}
              style={{
                width: '100%',
                color: '#000000',
                borderBottomColor: '#00A1A1',
                borderBottomWidth: 1,
              }}
              onValueChange={(itemValue, itemIndex) =>
                handleOnchange(itemValue, 'image')
              }>
              {images
                ? images.map(item => (
                    <Picker.Item
                      style={{
                        textAlign: 'left',
                        fontFamily: 'Raleway-Regular',
                        includeFontPadding: false,
                      }}
                      label={item.name}
                      value={item.slug}
                      key={item.slug}
                    />
                  ))
                : null}
            </Picker>
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
              onPress={() => setReinstallModal(false)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#00A1A1',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => reinstallThisServer(route.params.slug)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#00A1A1',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  includeFontPadding: false,
                }}>
                Reinstall
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Alias domains Modal */}
      <Modal
        testID={'modal'}
        isVisible={aliasModal}
        // swipeDirection={['up', 'left', 'right', 'down']}
        // onSwipeComplete={()=>setAliasModal(false)}
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
            Aliases
          </Text>
          <DataTable style={{height: '80%'}}>
            <FlatList
              data={server.aliases}
              renderItem={({item}) => (
                <DataTable.Row key={item}>
                  <DataTable.Cell>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginVertical: 10,
                      }}>
                      <TouchableOpacity
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        onPress={() => handleClick(item)}>
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0,161,161,0.26)',
                            borderRadius: 15 / 2,
                          }}>
                          <LinkIcon width={8} height={8} />
                        </View>
                        <Text
                          style={{
                            fontFamily: 'Raleway-Light',
                            fontSize: 12,
                            marginStart: 5,
                          }}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            />
            {/* {server.aliases.map((item) => (
              <DataTable.Row key={item}>
              <DataTable.Cell>
              <View style={{display:'flex',flexDirection:'column',marginVertical:10}}>
            <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={()=>handleClick(item)}>
            <View style={{width:12,height:12,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,161,161,0.26)',borderRadius:15/2}}>
                <LinkIcon width={8} height={8} />
            </View>
            <Text style={{fontFamily:'Raleway-Light',fontSize:12,marginStart:5}}>{item}</Text>
            </TouchableOpacity>
            </View>
              </DataTable.Cell>
            </DataTable.Row>
            ))} */}
          </DataTable>
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
              onPress={() => setAliasModal(false)}>
              <GradientButton text={'Okay, thanks'} />
              {/* <LinearGradient
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
              </LinearGradient> */}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Snackbar for event log */}
      <Snackbar
        visible={visibleSnack}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'view event log',
          onPress: () => {
            navigation.navigate('Events', {callbackId: callbackId});
          },
        }}
        style={{backgroundColor: '#008570', fontFamily: 'Raleway-Regular'}}
        theme={{
          colors: {
            accent: '#ffeb3b',
          },
        }}>
        You have running jobs ...
      </Snackbar>
    </>
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#008570" />
    </View>
  );
}
const styles = StyleSheet.create({
  card1: {
    margin: 3,
  },
  textheader: {
    color: '#111111',
    fontWeight: 'bold',
  },
  textcontent: {
    color: '#666666',
  },
  content: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  content1: {
    width: '100%',
    height: '100%',
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
  closebutton: {
    alignItems: 'flex-end',
  },
});
