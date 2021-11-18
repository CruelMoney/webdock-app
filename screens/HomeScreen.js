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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ActivityIndicator, Colors, FAB, Searchbar, IconButton,TextInput,Button, Card, Title, Paragraph} from 'react-native-paper';

import {Avatar, Divider} from 'react-native-paper';
import {getServers} from '../service/servers';
import {AuthContext} from '../components/context';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import { getLocations, getProfiles } from '../service/serverConfiguration';
export function HomeScreen({navigation}) {
  const [servers, setServers] = useState();
  const [locations,setLocations]= useState();
  const [profiles,setProfiles]=useState();
  const [snapshot,setSnapshot]=useState();
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
        });
        getLocations(userToken).then(data => {
          setLocations(...[data]);
          data.map((item)=>{
            getProfiles(userToken,item.id).then(datas => {
              setProfiles(...[{"profile":datas}]);
              console.log(datas);
            })
          })
          console.log(data);
        })
      } catch (e) {
        alert(e);
      }
    }, 1000);
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

        setServers(data.sort(sorter));
      });
    } catch (e) {
      alert(e);
    }
  };

  const renderStatusIcon=(icon)=>{
    if(icon=="error"){
      return <Icon name="info-outline" size={25} color="red" />;
    }else if(icon=="running"){
      return <Icon name="power-settings-new" size={25} color="green" />;
    }else if(icon=="stopped"){
      return <Icon name="power-settings-new" size={25} color="#F44336" />;
    }else if(icon=="provisioning"||icon=="rebooting"||icon=="starting"||icon=="stopping"||icon=="reinstalling"){
      return <ActivityIndicator animating={true} size={20} color={Colors.blue400}/>;
    }
    return null;
  }

  const Item = ({title, alias, dc, profile, ipv4,status}) => (
    <View style={styles.item}>
      <View style={styles.logo}>
        <Avatar.Image
          source={{
            uri: 'https://logo.clearbit.com/' + alias,
          }}
          theme={{colors: {primary: 'transparent'}}}
          style={styles.logoitem}
        />
      </View>
      <View style={styles.midinfo}>
        <Text style={styles.hostname}>{title}</Text>
        <Text style={styles.datacenterandprofile}>
          {
            <Image
              source={
                dc === 'fi'
                  ? {
                      uri:
                        'https://api.webdock.io/concrete/images/countries/europeanunion.png',
                    }
                  : {
                      uri:
                        'https://api.webdock.io/concrete/images/countries/us.png',
                    }
              }
            />
          }{' '}
          {profile}
        </Text>
        <Text style={styles.ipv4}>{ipv4}</Text>
      </View>
      <View style={styles.status}>
        {renderStatusIcon(status)}
      </View>
    </View>
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

  const [isModalVisible, setModalVisible]=useState();
  const toggleModal=()=>{
      setModalVisible(!isModalVisible);
  }

  const [newServerName,setNewServerName]=useState();
  const [newServerSlug,setNewServerSlug]=useState();
  const [newServerLocation,setNewServerLocation]=useState();
  const [newServerHardware,setNewServerHardware]=useState();
  const [newServerImage,setNewServerImage]=useState();
  const [newServerSnapshot,setNewServerSnapshot]=useState();

  return (
    <>
    <View width="100%" height="100%">
      <FlatList
        data={servers}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
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
              <Divider />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.slug}
      />
      <FAB
        style={styles.fab}
        color="white"
        icon="plus"
        animated={true}
        accessibilityLabel="Create new script"
        onPress={() =>
          toggleModal()
        }
      />
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
        <View style={{alignItems: 'flex-end'}}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal}
            />
          </View>

          <Text style={styles.contentTitle}>Create a Server in 2 minutes or less</Text>
          <Text style={{textAlign: 'center',paddingHorizontal:20}}>It's free to try. We will not charge your card until tomorrow morning.</Text>
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
              }}/>
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
              style={{marginTop:10}}/>

              {locations?locations.map(item=>{
              <Card>
                <Text>Hello</Text>
                <Card.Cover source={{uri:item.icon}} />
                <Card.Content>
                  <Title>Card title</Title>
                  <Paragraph>Card content</Paragraph>
                </Card.Content>
              </Card>
              }):null}

          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
          }}>
          <View style={{justifyContent:'center'}}>
            <Button
              mode="contained"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>console.log("nothing")}
              >
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
    width:'100%',
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
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
