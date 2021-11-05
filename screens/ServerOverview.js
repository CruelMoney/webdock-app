import AsyncStorage from '@react-native-community/async-storage';
import React,{useState} from 'react';
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
} from 'react-native';
import {Card, Provider, Title, Menu, Button, Divider, TextInput, IconButton, Paragraph, DataTable} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useEffect} from 'react/cjs/react.development';
import {
  dryRunForServerProfileChange,
  rebootServer,
  startServer,
  stopServer,
  suspendServer,
} from '../service/serverActions';
import {
  getImages,
  getLocations,
  getProfiles,
} from '../service/serverConfiguration';
import {getServerBySlug} from '../service/servers';
import Modal from "react-native-modal";
import { SvgUri, SvgXml } from 'react-native-svg';
import SVGCpu from '../assets/icon-cpu.svg';
import SVGRam from '../assets/icon-ram2.svg';
import SVGStorage from '../assets/icon-storage.svg';


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
    }, 1000);
    return unsubscribe;
  }, [navigation]);

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

    Alert.alert('Start Server', 'Do you really want to start this server?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          var result = await startServer(userToken, slug);
          console.log(result);
          if (result.status == 202) {
            onBackgroundRefresh();
            try {
              Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Server start initiated!',
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
          } else if (result.status == 404) {
            try {
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
        },
      },
    ]);
  };
  const stopThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert('Stop Server', 'Do you really want to stop this server?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          var result = await stopServer(userToken, slug);
          if (result.status == 202) {
            onBackgroundRefresh();
            try {
              Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Server shutdown initiated!',
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
          } else if (result.status == 404) {
            try {
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
        },
      },
    ]);
  };

  const rebootThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert('Reboot Server', 'Do you really want to reboot this server?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          var result = await rebootServer(userToken, slug);
          if (result.status == 202) {
            onBackgroundRefresh();
            try {
              Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Server shutdown initiated!',
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
          } else if (result.status == 404) {
            try {
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
        },
      },
    ]);
  };

  const suspendThisServer = async slug => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Suspend Server',
      'Do you really want to suspend this server?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            var result = await suspendServer(userToken, slug);
            if (result.status == 202) {
              onBackgroundRefresh();
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Server suspend initiated!',
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
            } else if (result.status == 404) {
              try {
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
          },
        },
      ],
    );
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
        setImages(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [profiles, setProfiles] = React.useState();
  const getAllProfiles = async lc => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getProfiles(userToken, lc).then(data => {
        data.map((item)=>{
          item.isExpanded=false;
        })
        setProfiles(data);
      });
    } catch (e) {
      alert(e);
    }
  };
  
  const LeftContent = props => <Title style={{color:'#00a1a1',marginRight:10}}>{profiles
    ? profiles.map(gr =>
        server.profile == gr.slug ? currency_symbols[gr.price.currency]+(gr.price.amount/100)+"/mo" : '',
      )
    : 'Unknown'}</Title>;

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
    'USD': '$', // US Dollar
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel
    'INR': '₹', // Indian Rupee
    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫', // Vietnamese Dong
};
  const [isModalVisible, setModalVisible]=useState();
  const toggleModal=()=>{
      setModalVisible(!isModalVisible);
  }
  const [selectedPlan,setSelectedPlan]=useState();

  const ExpandableComponent = ({item,onClickFunction}) => {
    const [layoutHeight, setLayoutHeight]=useState(0);

    useEffect(()=>{
      if(item.isExpanded){
        setLayoutHeight(null);
        setSelectedPlan(item);
      }else{
        setLayoutHeight(0);
      }
    },[item.isExpanded]);

    const fetchDryRun=async ()=>{
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          dryRunForServerProfileChange(userToken,route.params.slug,item.slug).then(data=>{
            setDryRun(data);
            console.log(data);
          })
        } catch (e) {
          alert(e);
        }
      };

    return(
      <Card style={{borderColor:item.isExpanded?'#00a1a1':'#eee',borderWidth:item.isExpanded?2:1,marginVertical:10}}
          onPress={onClickFunction}>
          <Card.Title titleStyle={{color:item.isExpanded?'#00a1a1':'black'}} title={item.name}
                  right={()=><Title style={{color:'#00a1a1',marginRight:10}}>{currency_symbols[item.price.currency]+(item.price.amount/100)+"/mo"}</Title>}/>
        {item.isExpanded?<Divider/>:null}
        {item.isExpanded?<Card.Content style={{height: layoutHeight, overflow:'hidden'}}>
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingTop:10,paddingHorizontal:10}}>
          
          <Paragraph style={{width:'90%',textAlign:'center'}}>{item.cpu.cores + " Cores," + item.cpu.threads+" Threads"}</Paragraph>
        </View>
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingTop:10,paddingHorizontal:10}}>
          
          <Paragraph style={{width:'90%',textAlign:'center'}}>{ Math.round(item.ram*0.001048576 * 100)/100 + " GB RAM"}</Paragraph>
        </View>
        
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingTop:10,paddingHorizontal:10}}>
          
          <Paragraph style={{width:'90%',textAlign:'center'}}>{ Math.round(item.disk*0.001048576 * 100)/100 + " GB On-Board SSD Drive"}</Paragraph>
        </View>
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingTop:10,paddingHorizontal:10}}>
        <Icon
            name="wifi"
            size={30}
            color="#787878"
           />
          <Paragraph style={{width:'90%',textAlign:'center'}}>1 Gbit/s-Port</Paragraph>
        </View>
        <View style={{display:'flex',flexDirection:'row',alignItems:'center',paddingTop:10,paddingHorizontal:10}}>
        <Icon
            name="location-on"
            size={30}
            color="#787878"
           />
          <Paragraph style={{width:'90%',textAlign:'center'}}>1 dedicated IPv4 address</Paragraph>
        </View>
        </Card.Content>:null}
      </Card>
    )
  }

  const updateLayout= (index)=>{
    LayoutAnimation.configureNext({
      duration: 300,
      create: 
      {
         type: LayoutAnimation.Types.easeInEaseOut,
         property: LayoutAnimation.Properties.opacity,
      },
      update: 
      {
         type: LayoutAnimation.Types.easeInEaseOut,
      }
     });
    const array=[...profiles];
    array.map((value,placeindex)=>
      placeindex===index?(array[placeindex]['isExpanded'])=!array[placeindex]['isExpanded']
      :(array[placeindex]['isExpanded'])=false
    );
    setProfiles(array);
  }
  if(Platform.OS === "android"){
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }


  useEffect(()=>{
    if(selectedPlan){
    setTimeout(async ()=>{
      let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          dryRunForServerProfileChange(userToken,route.params.slug,selectedPlan.slug).then(data=>{
            setDryRun(data);
          })
        } catch (e) {
          alert(e);
        }
    },1000);
  }
  },[selectedPlan])

  return server ? (
    <>
    <View width="100%" height="100%">
      <ScrollView>
        <View style={{justifyContent: 'flex-start', height: '90%'}}>
          <Card style={styles.card1}>
            <Card.Content>
              <Text style={styles.textheader}>Status</Text>
              <Text style={styles.textcontent}>
                {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </Text>
              <Text style={styles.textheader}>Aliases</Text>
              <Text style={styles.textcontent}>{server.aliases[0]}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.card1}>
            <Card.Content>
              <Text style={styles.textheader}>IPv4</Text>
              <Text style={styles.textcontent}>{server.ipv4}</Text>
              <Text style={styles.textheader}>IPv6</Text>
              <Text style={styles.textcontent}>{server.ipv6}</Text>
            </Card.Content>
          </Card>
          <Card style={styles.card1}>
            <Card.Content>
              <Text style={styles.textheader}>Image</Text>
              <Text style={styles.textcontent}>
                {images
                  ? images.map(gr => (server.image == gr.slug ? gr.name : ''))
                  : 'Unknown'}
              </Text>
              
              <Text style={styles.textheader}>Location</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  textAlign: 'center',
                }}>

                <Text style={styles.textcontent}>
                  {locations
                    ? locations.map(gr =>
                        server.location == gr.id
                          ? ' ' + gr.name + '/' + gr.city
                          : '',
                      )
                    : 'Unknown'}
                </Text>
              </View>


              <Text style={styles.textheader}>Profile</Text>
              <Text onPress={toggleModal} style={styles.textcontent} style = {{ color: '#039be5' }}>
                {profiles
                  ? profiles.map(gr =>
                      server.profile == gr.slug ? gr.name : '',
                    )
                  : 'Unknown'}
              <Text style = {{ color: '#039be5' }}> - Change Profile</Text></Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      <View
        style={{
          height: '10%',
          flexDirection: 'row',
          backgroundColor: 'white',
          alignItems: 'center',
          borderTopColor: '#e6e6e6',
          borderTopWidth: 0.3,
        }}>
        <View
          style={{
            width: '15%',
            alignItems: 'center',
            display: server.status == 'running' ? 'none' : 'flex',
          }}>
          <Icon
            name="play-arrow"
            size={32}
            color="green"
            onPress={() => startThisServer(server.slug)}
          />
        </View>
        <View
          style={{
            width: '15%',
            alignItems: 'center',
            display: server.status == 'running' ? 'flex' : 'none',
          }}>
          <Icon
            name="stop"
            size={32}
            color="red"
            onPress={() => stopThisServer(server.slug)}
          />
        </View>
        <View
          style={{
            width: '15%',
            alignItems: 'center',
            display: server.status == 'running' ? 'flex' : 'none',
          }}>
          <Icon
            name="replay"
            size={32}
            color="dodgerblue"
            onPress={() => rebootThisServer(server.slug)}
          />
        </View>
        <View style={{width: '15%', alignItems: 'center'}}>
          <Image
            source={require('../assets/termius.png')}
            style={{width: 32, height: 32, backgroundColor: 'transparent'}}
          />
        </View>
        <View
          style={{
            width: '20%',
            alignItems: 'center',
            marginLeft: 'auto',
          }}>
          <View style={{width: '30%', alignItems: 'center'}}>
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              style={{
                overflow: 'hidden',
              }}
              anchor={
                <Icon
                  name="more-vert"
                  size={32}
                  color="dodgerblue"
                  onPress={openMenu}
                />
              }>
              <Menu.Item
                icon="delete"
                onPress={() => {
                  deleteThisServer(server.slug);
                }}
                title="DELETE SERVER"
              />
              <Divider />

              <Menu.Item
                icon="pause"
                onPress={() => {
                  suspendThisServer(server.slug);
                }}
                title="SUSPEND SERVER"
              />
              <Menu.Item
                icon="autorenew"
                onPress={() => {
                  reinstallThisServer(server.slug);
                }}
                title="REINSTALL SERVER"
              />
            </Menu>
          </View>
        </View>
      </View>
    </View>
    <Modal isVisible={isModalVisible} style={{margin:0}}>
    <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
        style={{backgroundColor: 'white', paddingBottom: 20}}>
    <View style={styles.content1} >
        <View style={{width:'100%'}}>
        <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal}
            />
          </View>

          <Text style={styles.contentTitle}>Your Current Server Profile</Text>
        </View>
        <View style={{padding:20}}>
        {profiles
                  ? profiles.map((gr,key) =>
                      server.profile == gr.slug ?
          <ExpandableComponent 
            key={gr.slug}
            item={gr}
            onClickFunction={()=>{
              updateLayout(key);
            }}
          />:null):null}
          <Text style={styles.contentTitle}>Select a New Hardware Profile</Text>
          {profiles
                  ? profiles.map((gr,key) =>
                      server.profile != gr.slug ?
          <ExpandableComponent 
            key={gr.slug}
            item={gr}
            onClickFunction={()=>{
              updateLayout(key);
            }}
          />:null):null}

        </View>
        <Text style={styles.contentTitle}>Summary</Text>
        <DataTable style={{paddingHorizontal:20}}>
        <DataTable.Header>
        <DataTable.Title>Name - Profile - Period</DataTable.Title>
        <DataTable.Title numeric>Price</DataTable.Title>
      </DataTable.Header>
      {dryRun?<Text>{dryRun.response.chargeSummary.items[0].text}</Text>:null}
      {dryRun?dryRun.response?dryRun.response.chargeSummary.items.map((item)=>{
      <DataTable.Row>
        <DataTable.Cell>{item.text}</DataTable.Cell>
        <DataTable.Cell numeric>{item.price.amount}</DataTable.Cell>
      </DataTable.Row>
      }):null:null
      }
        </DataTable>
        <View style={{padding: 20}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',}}>
            <Button
              mode="contained"
              icon="send"
              style={{width:'100%'}}
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              >
              Add User
            </Button>
          </View>
          </View>
    </View>
    </ScrollView>
    </Modal>
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
    width:'100%',
    height:'100%',
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign:'center'
  },
  closebutton: {
    alignItems: 'flex-end',
  },
});
