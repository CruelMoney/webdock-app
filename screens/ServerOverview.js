import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
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
  ActivityIndicator,
  useTheme,
  ProgressBar,
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
import DashboardIcon from '../assets/dashboard-icon.svg';
import GlobeIcon from '../assets/globe-icon.svg';
import MoreIcon from '../assets/more-icon.svg';
import LinkIcon from '../assets/link-icon.svg';
import UtilizationIcon from '../assets/utilization-icon.svg';
import {getAllEventsBySlug, getEventsByCallbackId} from '../service/events';
import LinearGradient from 'react-native-linear-gradient';
import EditIcon from '../assets/edit-icon.svg';
import GradientButton from '../components/GradientButton';
import {Picker} from '@react-native-picker/picker';
import AccordionItem from '../components/AccordionItem';
import EmptyList from '../components/EmptyList';
import EventItem from '../components/EventItem';
import {getInstantMetrics} from '../service/serverMetrics';
import {setGlobalCallbackId} from '../service/storageEvents';

export default function ServerOverview({route, navigation}) {
  const serverCache = useRef({});
  const eventsCache = useRef({});
  const metricsCache = useRef({});
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [dryRun, setDryRun] = React.useState();
  const [server, setServer] = React.useState();
  const [events, setEvents] = React.useState([]);
  const [metrics, setMetrics] = React.useState([]);
  React.useLayoutEffect(() => {
    if (route.params?.slug) {
      navigation.setOptions({title: route.params.slug});
    }
  }, [navigation, route.params?.slug]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const slug = route.params.slug;
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        // Server
        if (serverCache.current[slug]) {
          setServer(serverCache.current[slug]);
        } else {
          getServerBySlug(userToken, slug).then(data => {
            setServer(data);
            serverCache.current[slug] = data;
            getAllProfiles(data.location);
          });
        }
        getAllLocations();
        getAllImages();
        // Metrics
        if (metricsCache.current[slug]) {
          setMetrics(metricsCache.current[slug]);
        } else {
          getInstantMetrics(userToken, slug).then(data => {
            setMetrics(data);
            metricsCache.current[slug] = data;
          });
        }
        // Events
        if (eventsCache.current[slug]) {
          setEvents(eventsCache.current[slug]);
        } else {
          if (route.params.callbackId) {
            getEventsByCallbackId(userToken, route.params.callbackId).then(
              data => {
                setEvents(data);
                eventsCache.current[slug] = data;
                setIsLoading(false);
              },
            );
          } else {
            getAllEventsBySlug(userToken, slug).then(data => {
              setEvents(data.slice(0, 3));
              eventsCache.current[slug] = data.slice(0, 3);
              setIsLoading(false);
            });
          }
        }
      } catch (e) {
        alert(e);
      }
    });
    return unsubscribe;
  }, [route]);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const onBackgroundRefresh = async () => {
    const slug = route.params.slug;
    serverCache.current[slug] = null;
    eventsCache.current[slug] = null;
    metricsCache.current[slug] = null;
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerBySlug(userToken, slug).then(data => {
        setServer(data);
        serverCache.current[slug] = data;
        getAllProfiles(data.location);
      });
      getAllLocations();
      getAllImages();
      getInstantMetrics(userToken, slug).then(data => {
        setMetrics(data);
        metricsCache.current[slug] = data;
      });
      if (route.params.callbackId) {
        getEventsByCallbackId(userToken, route.params.callbackId).then(data => {
          setEvents(data);
          eventsCache.current[slug] = data;
          setIsLoading(false);
        });
      } else {
        getAllEventsBySlug(userToken, slug).then(data => {
          setEvents(data.slice(0, 3));
          eventsCache.current[slug] = data.slice(0, 3);
          setIsLoading(false);
        });
      }
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const reinstallThisServer = async (slug, image) => {
    let userToken = null;
    console.log(slug, image);
    userToken = await AsyncStorage.getItem('userToken');

    var result = await reinstallServer(userToken, slug, image);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setReinstallModal(false);
        setCallbackId(result.headers.get('X-Callback-ID'));
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
        handleOnchange(data[0].slug, 'image');
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
    //UIManager.setLayoutAnimationEnabledExperimental(true);
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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
          onPress: () => navigation.navigate('Events'),
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
          <View
            style={{
              backgroundColor: '#4C9F5A',
              width: 10,
              height: 10,
              borderRadius: 10 / 2,
            }}></View>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
              color: '#4C9F5A',
            }}>
            {icon.charAt(0).toUpperCase() + icon.slice(1)}
          </Text>
        </>
      );
    } else if (icon == 'stopped') {
      return (
        <>
          <View
            style={{
              backgroundColor: '#E15241',
              width: 10,
              height: 10,
              borderRadius: 10 / 2,
            }}></View>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
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
            size={10}
            color={Colors.blue400}
          />
          ;
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
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
            size={10}
            color={Colors.blue400}
          />
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
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
            size={10}
            color={Colors.blue400}
          />
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 14,
              includeFontPadding: false,
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
      label: 'Server Activity',
      icon: <ActivityIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Activity',
      description:
        'See current and past network, disk, memory and CPU activity for your server',
    },
    {
      label: 'Server Scripts',
      icon: <ScriptsIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Scripts',
      description: 'Deploy and Execute Scripts or Files to your server',
    },
    {
      label: 'Shell users',
      icon: <UsersIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Shell Users',
      description: 'Manage your Shell/SFTP Users and deploy SSH Public Keys',
    },
    {
      label: 'Snapshots',
      icon: <SnapshotIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'Snapshots',
      description:
        'Create and delete server snapshots or restore your server from a snapshot (backups)',
    },
    {
      label: 'Upgrade/Downgrade',
      icon: <DashboardIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'https://webdock.io/en/dash/changeprofile/',
      description: 'Upgrade or Downgrade your server hardware',
    },
    {
      label: 'Server Identity',
      icon: <GlobeIcon width={19} height={19} color="#00a1a1" />,
      navigate: 'https://webdock.io/en/dash/server/',
      description:
        'Domain routing. Do this before generating new SSL certificates',
    },
  ];

  const [startModal, setStartModal] = useState(false);
  const [restartModal, setRestartModal] = useState(false);
  const [stopModal, setStopModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [reinstallModal, setReinstallModal] = useState(false);
  const [aliasModal, setAliasModal] = useState(false);
  const [callbackId, setCallbackId] = useState();
  const [selectedImageForReinstall, setSelectedImageForReinstall] =
    useState('');

  const [visibleSnack, setVisibleSnack] = React.useState(false);

  const onToggleSnackBar = () => setVisibleSnack(!visibleSnack);

  const onDismissSnackBar = () => setVisibleSnack(false);
  const handleOnchange = (itemValue, item) => {
    setSelectedImageForReinstall(itemValue);
  };
  const theme = useTheme();

  function getPercentage(allowed, usage) {
    const a = Number(allowed);
    const u = Number(usage);

    if (!a || isNaN(a) || isNaN(u)) return 0;
    const fraction = u / a;
    return Math.max(0, Math.min(1, parseFloat(fraction.toFixed(2))));
  }
  const openWebView = async url => {
    navigation.navigate('WebViewScreen', {
      uri: url,
      tokenType: 'query',
      token: await AsyncStorage.getItem('userToken'),
    });
  };
  const [eventDetailsModal, setEventDetailsModal] = useState(false);
  const [eventDetails, setEventDetails] = useState(false);

  const openSheet = event => {
    setEventDetails(event);
    setEventDetailsModal(true);
  };
  return server ? (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          backgroundColor: theme.colors.background,
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 24,
        }}>
        <View>
          <AccordionItem
            title="Overview"
            viewKey="ServerOverviewAccordion"
            topContent={
              <>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: theme.colors.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    gap: 15,
                  }}>
                  <Text
                    style={{
                      width: '20%',
                      fontFamily: 'Poppins-Medium',
                      fontWeight: '500',
                      fontSize: 14,
                      color: theme.colors.text,
                    }}>
                    Status
                  </Text>
                  {renderStatusIcon(server.status)}
                </View>
                <Divider />
              </>
            }
            bottomContent={
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  marginBottom: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 16,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  gap: 12,
                }}>
                <TouchableOpacity
                  onPress={() => setStartModal(true)}
                  style={{
                    width: '100%',
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
                      textAlign: 'center',
                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                      includeFontPadding: false,
                      color: '#4C9F5A',
                    }}>
                    Start
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setRestartModal(true)}
                  style={{
                    width: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    display: server.status == 'running' ? 'flex' : 'none',
                    backgroundColor: theme.colors.restartButton.background,
                    borderRadius: 4,
                    padding: 10,
                    gap: 8,
                  }}>
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(2, 34, 19, 1)',
                      borderRadius: 15 / 2,
                    }}>
                    <Icon
                      name="replay"
                      size={10}
                      color="white"
                      onPress={() => setRestartModal(true)}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 10,
                      includeFontPadding: false,
                      color: theme.colors.restartButton.text,
                    }}>
                    Restart server
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStopModal(true)}
                  style={{
                    width: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    display: server.status == 'running' ? 'flex' : 'none',
                    backgroundColor: 'rgba(217, 75, 75, 0.15)',
                    borderRadius: 4,
                    padding: 10,
                    gap: 8,
                  }}>
                  <View
                    style={{
                      width: 15,
                      height: 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(217, 75, 75, 1)',
                      borderRadius: 15 / 2,
                    }}>
                    <Icon
                      name="stop"
                      size={10}
                      color="white"
                      onPress={() => setStopModal(true)}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 10,
                      color: 'rgba(225, 82, 65, 1)',
                      includeFontPadding: false,
                    }}>
                    Stop server
                  </Text>
                </TouchableOpacity>
              </View>
            }>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 15,
              }}>
              <Text
                style={{
                  width: '20%',
                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                Alias
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {server.aliases.length == 1 ? (
                  <TouchableOpacity
                    key={server.aliases[0]}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
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
                        fontFamily: 'Poppins-Light',
                        fontSize: 14,
                        marginStart: 5,
                        includeFontPadding: false,
                        color: theme.colors.text,
                      }}>
                      {server.aliases[0]}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={{
                      fontFamily: 'Poppins-Light',
                      fontSize: 14,
                      color: theme.colors.text,
                    }}>
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
                      fontFamily: 'Poppins-Regular',
                      fontSize: 10,
                      color: '#00A1A1',
                    }}>
                    See {server.aliases.length - 1} more
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Divider />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 15,
              }}>
              <Text
                style={{
                  width: '20%',
                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                Profile
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Light',
                  fontSize: 14,
                  includeFontPadding: false,
                  color: theme.colors.text,
                }}>
                {'[' +
                  (server.virtualization === 'container' ? 'LXD' : 'KVM') +
                  '] '}
                {/* {profiles
                  ? profiles
                      .filter(item => server.profile === item.slug)
                      .map(item => {
                        return item.name;
                      })
                  : null} */}
              </Text>
            </View>
            <Divider />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 15,
              }}>
              <Text
                style={{
                  width: '20%',

                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                IPv4
              </Text>
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
                <Text
                  style={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 14,
                    includeFontPadding: false,
                    color: theme.colors.text,
                  }}>
                  {server.ipv4}
                </Text>
              </TouchableOpacity>
            </View>
            <Divider />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 12,
                gap: 15,
              }}>
              <Text
                style={{
                  width: '20%',

                  fontFamily: 'Poppins-Medium',
                  fontWeight: '500',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                IPv6
              </Text>
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
                <Text
                  style={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 14,
                    includeFontPadding: false,
                    color: theme.colors.text,
                  }}>
                  {server.ipv6}
                </Text>
              </TouchableOpacity>
            </View>
            <Divider />
          </AccordionItem>
        </View>

        <AccordionItem
          style={{marginBottom: 12}}
          title="Utilization"
          viewKey="ServerUtilizationAccordion"
          expanded={true}>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              justifyContent: 'center',
              padding: 12,
            }}>
            <View
              style={{
                width: '50%',
                backgroundColor: theme.colors.background,
                padding: 14,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#0000000D',
                gap: 12,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                Disk
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8 / 2,
                    backgroundColor: '#01AF35',
                  }}></View>

                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: theme.colors.text,
                  }}>
                  Used ({metrics?.disk?.lastSamplings?.amount} MiB)
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8 / 2,
                    backgroundColor: '#97C49C',
                  }}></View>
                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: theme.colors.text,
                  }}>
                  Allowed ({metrics?.disk?.allowed} MiB)
                </Text>
              </View>
              <ProgressBar
                progress={getPercentage(
                  metrics?.disk?.allowed,
                  metrics?.disk?.lastSamplings?.amount,
                )}
                color={'#01AF35'}
                style={{
                  height: 20,
                  borderRadius: 100,
                  backgroundColor: '#97C49C',
                }}
              />
            </View>
            <View
              style={{
                width: '50%',
                backgroundColor: theme.colors.background,
                padding: 14,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#0000000D',
                gap: 12,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  color: theme.colors.text,
                }}>
                Network
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8 / 2,
                    backgroundColor: '#01AF35',
                  }}></View>

                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: theme.colors.text,
                  }}>
                  Used ({metrics?.network?.total} MiB)
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8 / 2,
                    backgroundColor: '#97C49C',
                  }}></View>
                <Text
                  style={{
                    fontFamily: 'Poppins',
                    fontSize: 10,
                    color: theme.colors.text,
                  }}>
                  Allowed ({metrics?.network?.allowed} MiB)
                </Text>
              </View>

              <ProgressBar
                progress={getPercentage(
                  metrics?.network?.allowed,
                  metrics?.network?.total,
                )}
                color={'#01AF35'}
                style={{
                  height: 20,
                  borderRadius: 100,
                  backgroundColor: '#97C49C',
                }}
              />
            </View>
          </View>
        </AccordionItem>

        <View style={{marginBottom: 16}}>
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
              Events
            </Text>
          </View>
          {loading ? (
            <View
              style={{
                height: '10%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="small" color="#00A1A1" />
            </View>
          ) : (
            <FlatList
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              data={events}
              scrollEnabled={false}
              removeClippedSubviews={true}
              // onRefresh={() => onRefresh()}
              // refreshing={isFetching}
              renderItem={({item}) => (
                <View>
                  <EventItem
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
                  <View
                    style={{
                      height: 1,
                    }}></View>
                </View>
              )}
              keyExtractor={item => item.id}
              ListFooterComponent={
                <View
                  style={{
                    height: 42,
                    backgroundColor: theme.colors.surface,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    padding: 12,
                    alignItems: 'flex-end',
                  }}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('Events', {
                        slug: route.params.slug,
                        name: route.params.name,
                      })
                    }>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontWeight: '400',
                        fontSize: 12,
                        includeFontPadding: false,
                        color: theme.colors.primaryText,
                      }}>
                      All events →
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        </View>
        <View
          style={{
            marginBottom: 16,
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            justifyContent: 'space-between',
          }}>
          {tabs.map(item => (
            <View
              key={item.label}
              style={{
                width: '48%',
                marginBottom: 10,
                borderRightWidth: 4,
                borderRightColor: theme.colors.primary,
                backgroundColor: '#022213',
                borderRadius: 10,
              }}>
              <TouchableOpacity
                key={item.label}
                onPress={() =>
                  item?.navigate.includes('https://')
                    ? openWebView(item.navigate + route.params.slug)
                    : navigation.navigate(item.navigate, {
                        slug: route.params.slug,
                        name: route.params.name,
                      })
                }>
                <View style={{padding: 12}}>
                  <View style={{display: 'flex', gap: 8}}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {item.icon}
                    </View>

                    <Text
                      style={{
                        fontFamily: 'Poppins-SemiBold',
                        fontWeight: '600',
                        fontSize: 14,
                        lineHeight: 14 * 1.2,
                        color: 'white',
                      }}>
                      {item.label}
                    </Text>

                    <Text
                      style={{
                        fontFamily: 'Poppins-Light',
                        fontWeight: '300',
                        fontSize: 12,
                        lineHeight: 12 * 1.2,
                        color: 'white',
                      }}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
            Do you really want to archive this server?
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
              selectedValue={selectedImageForReinstall}
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
              onPress={() =>
                reinstallThisServer(
                  route.params.slug,
                  selectedImageForReinstall,
                )
              }
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
      {/* Server Event Detail Modal */}
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
