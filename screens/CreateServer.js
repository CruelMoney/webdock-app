import React, {useEffect, useState} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import CreateServerScript from './CreateServerScript';
import {View} from 'react-native-animatable';
import {
  Image,
  Keyboard,
  LayoutAnimation,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  UIManager,
} from 'react-native';
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
  Divider,
  Badge,
  HelperText,
} from 'react-native-paper';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
import ActivityIcon from '../assets/activity-icon.svg';
import EventsIcon from '../assets/events-icon.svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import XeonIcon from '../assets/xeon.png';
import RyzenIcon from '../assets/ryzen.png';
import LXDIcon from '../assets/lxd-icon.png';
import KVMIcon from '../assets/kvm-icon.png';
import NADatacenter from '../assets/datacenter-NA.png';
import EUDatacenter from '../assets/datacenter-EU.png';
import SVGCpu from '../assets/icon-cpu.svg';
import SVGRam from '../assets/icon-ram2.svg';
import SVGStorage from '../assets/icon-storage.svg';
import SVGWifi from '../assets/icon-wifi.svg';
import DoneIcon from '../assets/done-icon.svg';
import SVGSelected from '../assets/done-icon.svg';
import SVGLocation from '../assets/icon-location.svg';
import {getImages, getProfiles} from '../service/serverConfiguration';
import AsyncStorage from '@react-native-community/async-storage';
import GradientButton from '../components/GradientButton';
import {Picker} from '@react-native-picker/picker';
import {Svg, Circle} from 'react-native-svg';
import {useFocusEffect} from '@react-navigation/native';
import {getServerSlugStatus, provisionAServer} from '../service/servers';
import Toast from 'react-native-toast-message';
const Tab = createMaterialTopTabNavigator();
export default function CreateServer({route, navigation}) {
  return (
    <View width="100%" height="100%" style={{paddingTop: '8%'}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: '8%',
        }}>
        <TouchableOpacity onPress={navigation.goBack}>
          <BackIcon height={45} width={50} />
        </TouchableOpacity>
        <Text
          style={{
            color: '#00A1A1',
            fontFamily: 'Raleway-Medium',
            fontSize: 20,
          }}>
          Create Server
        </Text>
        <View style={{width: 50}}></View>
      </View>
      <Tab.Navigator
        swipeEnabled={false}
        tabBar={props => <MyTabBar {...props} />}
        tab>
        <Tab.Screen name="1. Server info" component={Step1} />
        <Tab.Screen name="2. Image" component={Step2} />
        <Tab.Screen name="3. Summary" component={Step3} />
      </Tab.Navigator>
    </View>
  );
}
export function Step1({navigation, route}) {
  //const [platforms, setPlatforms] = useState([]);
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
  const platforms = [
    {
      title: 'Intel Xeon',
      image: <Image width={19} height={19} color="#00a1a1" source={XeonIcon} />,
      content:
        'Enterprise grade redundant hardware. Lots of threads and RAM for your VPS.',
    },
    {
      title: 'AMD Ryzen',
      image: (
        <Image width={19} height={19} color="#00a1a1" source={RyzenIcon} />
      ),
      content:
        'Amazing water-cooled single thread performance. Less RAM for your VPS.',
    },
  ];
  const virtualization = [
    {
      title: 'Webdock LXD VPS',
      image: <Image width={19} height={19} color="#00a1a1" source={LXDIcon} />,
      content: 'Faster VPS but less software compatibility.',
    },
    {
      title: 'Virtual Machine',
      image: <Image width={19} height={19} color="#00a1a1" source={KVMIcon} />,
      content: 'Slower VPS but greater software compatibility.',
    },
  ];
  const locations = [
    {
      id: 'ca',
      title: 'North America',
      image: (
        <Image width={19} height={19} color="#00a1a1" source={NADatacenter} />
      ),
      content: 'Server will be located in our datacenter in Montreal, Canada',
    },
    {
      id: 'fi',
      title: 'Europe',
      image: (
        <Image width={19} height={19} color="#00a1a1" source={EUDatacenter} />
      ),
      content: 'Server will be located in our datacenter in Helsinki, Finland',
    },
  ];
  const [locationSelected, setLocationSelected] = useState(1);
  const [virtualizationSelected, setVirtulizationSelected] = useState(0);
  const [platformSelected, setPlatformSelected] = useState(0);
  const [newServerHardware, setNewServerHardware] = useState();
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getProfiles(userToken, locations[locationSelected].id).then(datas => {
          if (Array.isArray(datas)) {
            var count = 0;
            datas.map(item => {
              setNewServerHardware(count == 2 ? item : null);
              item.isExpanded = count == 2 ? true : false;
              count++;
            });

            datas = datas.filter(item =>
              platformSelected == 0
                ? !item.name.includes('Ryzen')
                : item.name.includes('Ryzen'),
            );
            setProfiles(datas);
          }
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, [navigation, locationSelected, virtualizationSelected, platformSelected]);
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
        <View style={{width: '86%'}}>
          <Card
            style={{
              borderColor: item.isExpanded ? '#00a1a1' : '#eee',
              borderWidth: item.isExpanded ? 2 : 1,
              borderRadius: 8,
              overflow: 'hidden',
              marginVertical: 10,
            }}
            onPress={onClickFunction}>
            <Card.Title
              titleStyle={{
                color: item.isExpanded ? 'white' : 'white',
                fontFamily: 'Raleway-Medium',
                fontSize: 16,
                includeFontPadding: false,
              }}
              title={item.name}
              style={{backgroundColor: '#00A1A1'}}
              right={() => (
                <Title
                  style={{
                    color: 'white',
                    marginRight: 20,
                    fontFamily: 'Raleway-Bold',
                    fontSize: 18,
                    includeFontPadding: false,
                  }}>
                  {item.price.amount / 100 + ' ' + item.price.currency + ' '}
                  <Text
                    style={{
                      includeFontPadding: false,
                      fontFamily: 'Raleway-Regular',
                      fontSize: 9,
                    }}>
                    /mo
                  </Text>
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
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                  }}>
                  <SVGCpu height={30} width={30} color="#787878" />
                  <Text
                    style={{
                      width: '85%',
                      textAlign: 'left',
                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                      includeFontPadding: false,
                    }}>
                    {item.cpu.cores + ' Cores,' + item.cpu.threads + ' Threads'}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 14,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <SVGRam height={30} width={30} color="#787878" />
                  </View>
                  <Text
                    style={{
                      width: '85%',
                      textAlign: 'left',
                      includeFontPadding: false,

                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                    }}>
                    {Math.round(item.ram * 0.001048576 * 100) / 100 + ' GB RAM'}
                  </Text>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 14,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between',
                  }}>
                  <SVGStorage height={30} width={30} color="#787878" />
                  <Text
                    style={{
                      width: '85%',
                      textAlign: 'left',
                      includeFontPadding: false,

                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                      justifyContent: 'space-between',
                    }}>
                    {Math.round(item.disk * 0.001048576 * 100) / 100 +
                      ' GB On-Board SSD Drive'}
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 14,
                    justifyContent: 'space-between',

                    paddingHorizontal: 10,
                  }}>
                  <SVGWifi height={30} width={30} color="#787878" />
                  <Text
                    style={{
                      width: '85%',
                      includeFontPadding: false,

                      textAlign: 'left',
                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                    }}>
                    1 Gbit/s-Port
                  </Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    paddingHorizontal: 10,
                  }}>
                  <SVGLocation height={30} width={30} />
                  <Text
                    style={{
                      width: '85%',
                      textAlign: 'left',
                      includeFontPadding: false,

                      fontFamily: 'Raleway-SemiBold',
                      fontSize: 12,
                    }}>
                    1 dedicated IPv4 address
                  </Text>
                </View>
              </Card.Content>
            ) : null}
          </Card>
          {item.isExpanded ? (
            <DoneIcon
              style={{position: 'absolute', top: 0, right: -25}}
              width={50}
            />
          ) : null}
        </View>
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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
      }}
      style={{marginTop: 10}}>
      <View style={{paddingBottom: 10, paddingHorizontal: '8%'}}>
        <SectionTitle
          title="Platform"
          question="Which should i choose?"
          questionUrl="https://webdock.io/tools/provision_info/platform?lang=en_US&fromApp=true"
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {platforms.map((item, index) => (
            <SingleCard
              key={item.title}
              title={item.title}
              content={item.content}
              image={item.image}
              selected={platformSelected === index}
              onChange={() => setPlatformSelected(index)}
            />
          ))}
        </View>
      </View>
      <View style={{paddingBottom: 10, paddingHorizontal: '8%'}}>
        <SectionTitle
          title="Virtualization"
          question="Which should i choose?"
          questionUrl="https://webdock.io/tools/provision_info/virtualization?lang=en_US&fromApp=true"
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {virtualization.map((item, index) => (
            <SingleCard
              key={item.title}
              title={item.title}
              content={item.content}
              image={item.image}
              selected={virtualizationSelected === index}
              onChange={() => setVirtulizationSelected(index)}
            />
          ))}
        </View>
      </View>
      <View style={{paddingBottom: 10, paddingHorizontal: '8%'}}>
        <SectionTitle
          title="Location"
          question="Which should i choose?"
          questionUrl="https://webdock.io/tools/provision_info/location?lang=en_US&fromApp=true"
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {locations.map((item, index) => (
            <SingleCard
              key={item.title}
              title={item.title}
              content={item.content}
              image={item.image}
              selected={locationSelected === index}
              onChange={() => setLocationSelected(index)}
            />
          ))}
        </View>
      </View>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <View style={{width: '86%'}}>
          <SectionTitle
            title="Profile"
            question="Which should i choose?"
            questionUrl="https://webdock.io/tools/provision_info/profile?lang=en_US&fromApp=true"
          />
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
      </View>
      <TouchableOpacity
        style={{marginVertical: 20, paddingHorizontal: '8%'}}
        onPress={() =>
          navigation.navigate('2. Image', {
            virtualization: virtualization[virtualizationSelected],
            platform: platforms[platformSelected],
            location: locations[locationSelected],
            profile: newServerHardware,
          })
        }>
        <GradientButton text="Continue" />
      </TouchableOpacity>
    </ScrollView>
  );
}
export function Step2({route, navigation}) {
  const [images, setImages] = useState([]);
  const [webServerImages, setWebServerImages] = useState([]);
  const [desktopImages, setDesktopImages] = useState([]);
  const [cleanImages, setCleanImages] = useState([]);
  const [selectedWebServer, setSelectedWebServer] = useState();
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getImages(userToken).then(data => {
          setImages(data);
          let webImages = {};
          let desktop = [];
          let cleanLinux = [];
          // let datas = [{label: 'Your own image', value: 'snapshot'}];
          data.map(item => {
            if (item.phpVersion != null && item.webServer != null) {
              const webServer = item.webServer;
              if (!webImages[webServer]) {
                webImages[webServer] = [];
              }
              webImages[webServer].push(item);
            } else if (item.name.includes('Desktop')) {
              desktop.push({label: item.name, value: item.slug});
            } else {
              cleanLinux.push({label: item.name, value: item.slug});
            }
          });
          setWebServerImages(webImages);
          setSelectedWebServer(Object.keys(webImages)[0]);
          setCleanImages(cleanLinux);
          setDesktopImages(desktop);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);
  const [inputs, setInputs] = React.useState({
    name: '',
    slug: '',
    image: '',
  });
  const [errors, setErrors] = React.useState({});
  const validate = () => {
    Keyboard.dismiss();
    // setSubmitting(true);
    let isValid = true;

    if (!inputs.name) {
      handleError('Server name is required', 'name');
      isValid = false;
    }
    if (!inputs.slug) {
      handleError('Server slug is required', 'slug');
      isValid = false;
    }
    if (isValid) {
      navigation.navigate('3. Summary', {
        ...route.params,
        name: inputs['name'],
        slug: inputs['slug'],
        image: images.filter(item => item.slug == inputs['image']),
      });
    } else {
      // setSubmitting(false);
    }
  };
  const generateSlug = async text => {
    let response = await getServerSlugStatus(text);
    if (response.isOK == true) {
      setInputs(prevState => ({...prevState, ['slug']: response.slug}));
    }
  };
  const handleOnchange = async (text, input) => {
    if (input == 'name') {
      generateSlug(text);
    }
    setInputs(prevState => ({...prevState, [input]: text}));
  };
  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };
  const [imageTypeSelected, setImageTypeSelected] = useState(0);
  const [phpVersion, setPhpVersion] = useState('');

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
      }}
      style={{marginTop: 10, paddingHorizontal: '8%'}}>
      <View>
        <SectionTitle
          title="Image"
          question="Which should i choose?"
          questionUrl="https://webdock.io/tools/provision_info/image?lang=en_US&fromApp=true"
        />
        <Card
          style={{
            borderColor: '#00a1a1',
            borderWidth: imageTypeSelected == 0 ? 1.5 : 0,
            borderRadius: 8,
            overflow: 'hidden',
            paddingBottom: 0,
            marginVertical: 10,
          }}
          onPress={() => setImageTypeSelected(0)}>
          <Card.Title
            title={'Web server'}
            titleStyle={{
              color: 'white',
              fontFamily: 'Raleway-Medium',
              fontSize: 16,
              includeFontPadding: false,
            }}
            subtitle={'Ubuntu Jammy 22.04'}
            subtitleStyle={{
              color: 'white',
              fontFamily: 'Raleway-Light',
              fontSize: 12,
              includeFontPadding: false,
            }}
            style={{backgroundColor: '#00A1A1', color: 'white'}}
            right={() => (
              <Title style={{color: 'white', marginRight: 10}}>
                <RadioButton
                  height={30}
                  width={30}
                  checked={imageTypeSelected == 0}
                />
              </Title>
            )}
          />
          {imageTypeSelected == 0 ? (
            <Card.Content
              style={{
                height: null,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    includeFontPadding: false,
                  }}>
                  Select a Webserver
                </Text>
                <View
                  style={{
                    width: '100%',
                    borderBottomColor: '#00A1A1',
                    borderBottomWidth: 1,
                  }}>
                  <Picker
                    selectedValue={selectedWebServer}
                    style={{
                      width: '100%',
                      includeFontPadding: false,
                    }}
                    onValueChange={(itemValue, itemIndex) => {
                      setSelectedWebServer(itemValue);
                    }}>
                    {Object.keys(webServerImages).map(item => (
                      <Picker.Item
                        style={{
                          textAlign: 'left',
                          fontFamily: 'Raleway-Regular',
                          includeFontPadding: false,
                        }}
                        label={item}
                        value={item}
                        key={item}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    includeFontPadding: false,
                  }}>
                  {'PHP '}
                  {'8.2'}
                  {' installed'}
                </Text>
                <View
                  style={{
                    width: '100%',
                    // borderBottomColor: '#00A1A1',
                    // borderBottomWidth: 1,
                  }}>
                  {/* <Picker
                    selectedValue={inputs['image']}
                    style={{
                      width: '100%',
                      includeFontPadding: false,
                      padding: 0,
                    }}
                    onValueChange={(itemValue, itemIndex) =>
                      handleOnchange(itemValue, 'image')
                    }>
                    {webServerImages
                      ? webServerImages[selectedWebServer]
                        ? webServerImages[selectedWebServer].map(item => (
                            <Picker.Item
                              style={{
                                textAlign: 'left',
                                fontFamily: 'Raleway-Regular',
                                includeFontPadding: false,
                              }}
                              label={'PHP ' + item.phpVersion}
                              value={item.slug}
                              key={item.slug}
                            />
                          ))
                        : null
                      : null}
                  </Picker> */}
                  <Text
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      color: '#555555',
                      fontSize: 14,
                      fontFamily: 'Raleway-Regular',
                      includeFontPadding: false,
                    }}>
                    You can change PHP version at any time on the Manage PHP
                    page
                  </Text>
                </View>
              </View>
            </Card.Content>
          ) : null}
        </Card>
        <Card
          style={{
            borderColor: '#00a1a1',
            borderWidth: imageTypeSelected == 1 ? 1.5 : 0,
            borderRadius: 8,
            overflow: 'hidden',
            marginVertical: 10,
          }}
          elevation={0}
          onPress={() => setImageTypeSelected(1)}>
          <Card.Title
            title={'Ubuntu Desktop'}
            titleStyle={{
              color: 'white',
              fontFamily: 'Raleway-Medium',
              fontSize: 16,
              includeFontPadding: false,
            }}
            subtitleStyle={{color: 'white'}}
            style={{backgroundColor: '#00A1A1', color: 'white'}}
            right={() => (
              <Title style={{color: 'white', marginRight: 10}}>
                <RadioButton
                  height={30}
                  width={30}
                  checked={imageTypeSelected == 1}
                />
              </Title>
            )}
          />
          {imageTypeSelected == 1 ? (
            <Card.Content
              style={{
                height: null,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    includeFontPadding: false,
                  }}>
                  Select a Virtual Desktop
                </Text>
                <View
                  style={{
                    width: '100%',
                    borderBottomColor: '#00A1A1',
                    borderBottomWidth: 1,
                  }}>
                  <Picker
                    selectedValue={inputs['image']}
                    style={{
                      width: '100%',
                      includeFontPadding: false,
                    }}
                    onValueChange={(itemValue, itemIndex) =>
                      handleOnchange(itemValue, 'image')
                    }>
                    {desktopImages.map(item => (
                      <Picker.Item
                        style={{
                          textAlign: 'left',
                          fontFamily: 'Raleway-Regular',
                          includeFontPadding: false,
                        }}
                        label={item.label}
                        value={item.value}
                        key={item.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card.Content>
          ) : null}
          <Card.Content style={{height: null, overflow: 'hidden'}}>
            <Text
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingTop: 14,
                paddingHorizontal: 10,
                color: '#555555',
                fontSize: 12,
                fontFamily: 'Raleway-Regular',
                includeFontPadding: false,
              }}>
              Your Desktop in the Cloud. Quick to set up and easy to connect
              Desktops look and work the best on our LXD instances.
            </Text>
          </Card.Content>
        </Card>
        <Card
          elevation={0}
          style={{
            borderColor: '#00a1a1',
            borderWidth: imageTypeSelected == 2 ? 1.5 : 0,
            borderRadius: 8,
            overflow: 'hidden',
            marginVertical: 10,
          }}
          onPress={() => setImageTypeSelected(2)}>
          <Card.Title
            title={'Clean Linux OS'}
            titleStyle={{
              color: 'white',
              fontFamily: 'Raleway-Medium',
              fontSize: 16,
              includeFontPadding: false,
            }}
            subtitleStyle={{color: 'white'}}
            style={{backgroundColor: '#00A1A1', color: 'white'}}
            right={() => (
              <Title style={{color: 'white', marginRight: 10}}>
                <RadioButton
                  height={30}
                  width={30}
                  checked={imageTypeSelected == 2}
                />
              </Title>
            )}
          />
          {imageTypeSelected == 2 ? (
            <Card.Content
              style={{
                height: null,
                overflow: 'hidden',
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    includeFontPadding: false,
                  }}>
                  Select an Operating System
                </Text>
                <View
                  style={{
                    width: '100%',
                    borderBottomColor: '#00A1A1',
                    borderBottomWidth: 1,
                  }}>
                  <Picker
                    selectedValue={inputs['image']}
                    style={{
                      width: '100%',
                      color: '#000000',
                      borderBottomColor: '#00A1A1',
                      borderBottomWidth: 1,
                    }}
                    onValueChange={(itemValue, itemIndex) =>
                      handleOnchange(itemValue, 'image')
                    }>
                    {cleanImages.map(item => (
                      <Picker.Item
                        style={{
                          textAlign: 'left',
                          fontFamily: 'Raleway-Regular',
                          includeFontPadding: false,
                        }}
                        label={item.label}
                        value={item.value}
                        key={item.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card.Content>
          ) : null}
          <Card.Content style={{height: null, overflow: 'hidden'}}>
            <Text
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingTop: 14,
                paddingHorizontal: 10,
                color: '#555555',
                fontSize: 12,
                fontFamily: 'Raleway-Regular',
                includeFontPadding: false,
              }}>
              Clean Linux Operating system. Do not use this if you want to host
              a website or web app, in which case choose our Web Server image
              instead (unless you want to install your own control panel).
            </Text>
          </Card.Content>
        </Card>
      </View>
      <View>
        <SectionTitle title="Server name" />
        <TextInput
          mode="outlined"
          label="Name"
          placeholder="Enter a descriptive server name"
          value={inputs['name']}
          onChangeText={text => handleOnchange(text, 'name')}
          selectionColor="#00A1A1"
          dense={true}
          placeholderTextColor="#969696"
          outlineColor="#00A1A1"
          activeOutlineColor="#00A1A1"
          underlineColorAndroid="transparent"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: {
              primary: '#00a1a1',
              accent: '#00a1a1',
              placeholder: '#00A1A1',
            },
          }}
          onFocus={() => handleError(null, 'name')}
          error={errors.name}
        />
        <HelperText type="error" visible={errors.name}>
          {errors.name}
        </HelperText>
        <TextInput
          mode="outlined"
          label="Slug"
          placeholder="Server shortname (slug)"
          value={inputs['slug']}
          onChangeText={text => handleOnchange(text, 'slug')}
          selectionColor="#00A1A1"
          dense={true}
          outlineColor="#00A1A1"
          placeholderTextColor="#969696"
          activeOutlineColor="#00A1A1"
          underlineColorAndroid="transparent"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          theme={{
            colors: {
              primary: '#00a1a1',
              accent: '#00a1a1',
              placeholder: '#00A1A1',
            },
          }}
          onFocus={() => handleError(null, 'slug')}
          error={errors.slug}
        />
        <HelperText type="error" visible={errors.slug}>
          {errors.slug}
        </HelperText>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 20,
        }}>
        <TouchableOpacity onPress={() => navigation.navigate('1. Server info')}>
          <GradientButton text="Go Back" />
        </TouchableOpacity>
        <TouchableOpacity onPress={validate}>
          <GradientButton text="Continue" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
export function Step3({navigation, route}) {
  const validate = async () => {
    Keyboard.dismiss();
  };
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await provisionAServer(
      userToken,
      route.params.name,
      route.params.slug,
      route.params.location.id,
      route.params.profile.slug,
      route.params.virtualization.title == 'Webdock LXD VPS'
        ? 'container'
        : 'kvm',
      route.params.image[0].slug,
      0,
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server provisioning initiated',
          visibilityTime: 4000,
          autoHide: true,
        });
        navigation.pop();
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
    } else {
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

  return (
    <View
      style={{
        paddingHorizontal: '8%',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
      }}>
      <View>
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
                  {route.params ? route.params.name : ''}
                </Text>
              </View>
            </View>
            <View style={{display: 'flex', flexDirection: 'row', width: '10%'}}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('UpdateServerMetadata')
                }></TouchableOpacity>
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
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <View
              style={{
                display: 'flex',
                width: '80%',
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                  Location
                </Text>
                <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                  {route.params ? route.params.location.title : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '20%',
                justifyContent: 'center',
              }}>
              {route.params ? route.params.location.image : ''}
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
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <View
              style={{
                display: 'flex',
                width: '80%',
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                  Virtualization
                </Text>
                <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                  {route.params ? route.params.virtualization.title : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '20%',
                justifyContent: 'center',
              }}>
              {route.params ? route.params.virtualization.image : ''}
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
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <View
              style={{
                display: 'flex',
                width: '80%',
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                  Platform
                </Text>
                <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                  {route.params ? route.params.platform.title : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '20%',
                justifyContent: 'center',
              }}>
              {route.params ? route.params.platform.image : ''}
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
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <View
              style={{
                display: 'flex',
                width: '80%',
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                  Image
                </Text>
                <Text style={{fontFamily: 'Raleway-Light', fontSize: 12}}>
                  {route.params ? route.params.image[0].name : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '20%',
                justifyContent: 'center',
              }}></View>
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
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <View
              style={{
                display: 'flex',
                width: '80%',
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
                  {route.params
                    ? route.params.profile
                      ? route.params.profile.name
                      : ''
                    : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '20%',
                justifyContent: 'center',
              }}></View>
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
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
            }}>
            <View
              style={{
                display: 'flex',
                width: '70%',
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View>
                <Text style={{fontFamily: 'Raleway-Medium', fontSize: 12}}>
                  Monthly
                </Text>
              </View>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '30%',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Raleway-Bold',
                  fontSize: 18,
                  includeFontPadding: false,
                }}>
                {(route.params
                  ? route.params.profile
                    ? route.params.profile.price.amount / 100
                    : 0
                  : 0) + ' '}
                {route.params
                  ? route.params.profile
                    ? route.params.profile.price.currency
                    : ''
                  : '' + ' '}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 20,
        }}>
        <TouchableOpacity onPress={() => navigation.navigate('2. Image')}>
          <GradientButton text="Go Back" />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendRequest}>
          <GradientButton text="Create" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
function SectionTitle({title, question, questionUrl}) {
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
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5,
      }}>
      <Text style={styles.titleText}>{title}</Text>
      <TouchableOpacity onPress={() => handleClick(questionUrl)}>
        <Text style={styles.infoUrl}>{question}</Text>
      </TouchableOpacity>
    </View>
  );
}
function SingleCard({image, title, content, selected, onChange}) {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <View
      key={title}
      style={{
        width: '48%',
        marginBottom: 10,
        backgroundColor: selected ? 'rgba(0, 161, 161, 0.06)' : 'white',
        borderColor: selected ? 'rgba(0, 161, 161, 1)' : 'white',
        borderWidth: 1,
        borderRadius: 10,
      }}>
      <TouchableOpacity onPress={onChange}>
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
                }}>
                {image}
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
                  fontSize: 14,
                  marginStart: 5,
                  marginBottom: 5,
                  color: '#00a1a1',
                }}>
                {title}
              </Text>
              <Text
                style={{
                  marginStart: 5,
                  marginBottom: 5,
                  color: '#393939',
                  fontSize: 9,
                }}>
                {content}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function MyTabBar({state, descriptors, navigation}) {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '8%',
      }}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          // const event = navigation.emit({
          //   type: 'tabPress',
          //   target: route.key,
          //   canPreventDefault: true,
          // });
          // if (!isFocused && !event.defaultPrevented) {
          //   // The `merge: true` option makes sure that the params inside the tab screen are preserved
          //   navigation.navigate({name: route.name, merge: true});
          // }
        };

        const onLongPress = () => {
          // navigation.emit({
          //   type: 'tabLongPress',
          //   target: route.key,
          // });
        };

        return (
          <View style={{flex: 1, paddingHorizontal: 5}} key={route.key}>
            <TouchableOpacity
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                alignItems: 'flex-start',
                paddingVertical: 16,
              }}>
              <Text
                style={{
                  color: isFocused ? '#00A1A1' : '#BFBFBF',
                  fontFamily: 'Raleway-Regular',
                  fontSize: 12,
                }}>
                {label}
              </Text>
              <View
                style={{
                  marginTop: 3,
                  width: '100%',
                  backgroundColor: isFocused ? '#00A1A1' : '#BFBFBF',
                  height: 1.5,
                }}></View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
const RadioButton = ({checked}) => {
  return (
    <Svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Circle
        cx="9.52026"
        cy="9.69507"
        r="9.08423"
        fill="white"
        fillOpacity="0.55"
      />
      <Circle
        cx="9.52032"
        cy="9.69513"
        r="5.8421"
        fill={checked ? 'white' : 'none'}
        fillOpacity="0.9"
      />
    </Svg>
  );
};
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
  badge: {
    position: 'absolute',
    zIndex: 1,
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
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
    fontSize: 18,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    textAlign: 'left',
  },
  infoUrl: {
    color: '#00A1A1',
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    includeFontPadding: false,
  },
});
