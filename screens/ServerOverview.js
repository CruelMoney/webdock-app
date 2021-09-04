import AsyncStorage from '@react-native-community/async-storage';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {Card, Provider, Title, Menu, Button, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useEffect} from 'react/cjs/react.development';
import {
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

export default function ServerOverview({route, navigation}) {
  const [visible, setVisible] = React.useState(false);
  const [lcid, setLcid] = React.useState();
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
  return server ? (
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
              {/* {images ? (
                  images.map(gr =>
                    server.image == gr.slug ? (
                      <Text key={gr.slug} style={styles.textcontent}>
                        {gr.name}
                      </Text>
                    ) : (
                      <></>
                    ),
                  )
                ) : (
                  <Text>Unknown</Text>
                )} */}
              <Text style={styles.textheader}>Location</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  textAlign: 'center',
                }}>
                {/* <Image
                    style={{height: 15, width: 15, alignSelf: 'center'}}
                    source={{
                      uri: locations
                        ? locations.map(gr =>
                            server.location == gr.id
                              ? gr.icon
                              : 'https://api.webdock.io/concrete/images/countries/europeanunion.png',
                          )
                        : 'https://api.webdock.io/concrete/images/countries/europeanunion.png',
                    }}
                  /> */}
                <Text style={styles.textcontent}>
                  {/* <Image
                    style={{
                      height: 15,
                      width: 15,
                      alignSelf: 'center',
                    }}
                    source={{
                      uri: getLocationIcon(server.location),
                    }}
                  /> */}
                  {locations
                    ? locations.map(gr =>
                        server.location == gr.id
                          ? ' ' + gr.name + '/' + gr.city
                          : '',
                      )
                    : 'Unknown'}
                </Text>
              </View>

              {/* {locations ? (
                  locations.map(gr =>
                    server.location == gr.id ? (
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          textAlign: 'center',
                        }}>
                        <Image
                          style={{height: 15, width: 15, alignSelf: 'center'}}
                          source={{
                            uri: gr.icon,
                          }}
                        />
                        <Text key={gr.id} style={styles.textcontent}>
                          {' ' + gr.name + '/' + gr.city}{' '}
                        </Text>
                      </View>
                    ) : (
                      <></>
                    ),
                  )
                ) : (
                  <Text>Unknown</Text>
                )} */}

              <Text style={styles.textheader}>Profile</Text>
              <Text style={styles.textcontent}>
                {profiles
                  ? profiles.map(gr =>
                      server.profile == gr.slug ? gr.name : '',
                    )
                  : 'Unknown'}
              </Text>
              {/* {profiles ? (
                  profiles.map(gr =>
                    server.profile == gr.slug ? (
                      <Text key={gr.slug} style={styles.textcontent}>
                        {gr.name}
                      </Text>
                    ) : (
                      <></>
                    ),
                  )
                ) : (
                  <Text>Unknown</Text>
                )} */}
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
});
