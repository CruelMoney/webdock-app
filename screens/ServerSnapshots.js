import AsyncStorage from '@react-native-community/async-storage';
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
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  Snackbar,
  IconButton,
  TextInput,
} from 'react-native-paper';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import {
  deleteServerSnapshot,
  getServerSnapshots,
} from '../service/serverSnapshots';
import {
  createSnapshotForServer,
  restoreFromSnapshot,
} from '../service/serverActions';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import DeleteIcon from '../assets/delete-icon.svg';
import EmptyList from '../components/EmptyList';
export default function ServerSnapshots({route, navigation}) {
  const [serverSnapshots, setSnapshots] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerSnapshots(userToken, route.params.slug).then(data => {
          setSnapshots(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);

  const createSnapshot = async name => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createSnapshotForServer(
      userToken,
      route.params.slug,
      name,
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Snapshot initiated',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal2();
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
          text1: 'Server or snapshot not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };

  const Item = ({item}) => (
    <>
      <View
        style={{backgroundColor: 'white', borderRadius: 10, marginBottom: 10}}>
        <View
          style={{
            display: 'flex',
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text style={{fontFamily: 'Raleway-Regular', fontSize: 14}}>
              {item.name == 'user' ? item.name : item.date}
            </Text>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <Text
                style={{
                  width: 100,
                  fontFamily: 'Raleway-Light',
                  fontSize: 12,
                  includeFontPadding: false,
                  color: '#8F8F8F',
                }}>
                {item.type} snapshot
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            {item.completed ? (
              <TouchableOpacity
                style={{marginHorizontal: 2}}
                onPress={() => modalOpen(item)}>
                <View
                  style={{
                    width: 25,
                    height: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(3,155,229,0.26)',
                    borderRadius: 25 / 2,
                  }}>
                  <Icon name="history" size={15} color="#449ADF" />
                </View>
              </TouchableOpacity>
            ) : null}
            {/* {item.completed?<TouchableOpacity onPress={()=>{
            setSelectedSnapshot(item);
            setIsDeleteModalVisible(true)}}>
              <View style={{width:30,height:23,justifyContent:'center',alignItems:'center'}}>
            <View style={{width:23,height:23,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(3,155,229,0.26)',borderRadius:23/2}}>
            <Icon
              name="history"
              size={15}
              color="#449ADF"
              onPress={() => setStartModal(true)}
            />
            </View>
            </View></TouchableOpacity>:null} */}
            {item.deletable ? (
              <TouchableOpacity
                style={{
                  width: 25,
                  marginHorizontal: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSelectedSnapshot(item);
                  setIsDeleteModalVisible(true);
                }}>
                <DeleteIcon fill="#D94B4B" width={25} height={25} />
              </TouchableOpacity>
            ) : null}
          </View>
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
      getServerSnapshots(userToken, route.params.slug).then(data => {
        setSnapshots(data);
        setIsFetching(false);
      });
    } catch (e) {
      alert(e);
    }
  };
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerSnapshots(userToken, route.params.slug).then(data => {
        setSnapshots(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [isModalVisible, setModalVisible] = useState();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [isModalVisible2, setModalVisible2] = useState();
  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };
  const restoreThisSnapshot = async snapshotId => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await restoreFromSnapshot(
      userToken,
      route.params.slug,
      snapshotId,
    );
    if (result.status == 202) {
      try {
        toggleModal();
        setCallbackId(result.headers.get('x-callback-id'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 400) {
      try {
        toggleModal();
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
          text1: 'Server or snapshot not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
        toggleModal();
      } catch (e) {
        alert(e);
      }
    }
  };

  const [modalData, setModalData] = useState();
  const modalOpen = item => {
    toggleModal();
    setSelectedSnapshot(item);
  };
  const [newSnapshotName, setNewSnapshotName] = useState();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState();

  const [callbackId, setCallbackId] = useState();

  const [visibleSnack, setVisibleSnack] = useState(false);

  const onToggleSnackBar = () => setVisibleSnack(!visibleSnack);

  const onDismissSnackBar = () => setVisibleSnack(false);

  const deleteSnapshotsAlert = async pkey => {
    let userToken = null;
    console.log('test');

    userToken = await AsyncStorage.getItem('userToken');

    var result = await deleteServerSnapshot(userToken, route.params.slug, pkey);
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        setIsDeleteModalVisible(false);
        setCallbackId(result.headers.get('x-callback-id'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 404) {
      try {
        setIsDeleteModalVisible(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Script not found',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
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
            {route.params.slug}
          </Text>
          <View style={{width: 50}}></View>
        </View>
        <FlatList
          style={{marginTop: 20}}
          data={serverSnapshots}
          onRefresh={() => onRefresh()}
          refreshing={isFetching}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{height: 60}}></View>}
          renderItem={({item}) => (
            <>
              <TouchableOpacity onPress={() => modalOpen(item)}>
                <View>
                  <Item item={item} />
                </View>
              </TouchableOpacity>
            </>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={<EmptyList />}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateServerSnapshot')}
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
        </TouchableOpacity>
      </View>
      {/* Delete Snapshot Modal */}
      <Modal
        testID={'modal'}
        isVisible={isDeleteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setIsDeleteModalVisible(false)}
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
            Delete snapshot {selectedSnapshot ? selectedSnapshot.name : null}
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 14,
              includeFontPadding: false,
              color: '#000000',
              marginVertical: 10,
            }}>
            Please confirm you want to delete this snapshot
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 14,
                includeFontPadding: false,
                color: '#000000',
                marginStart: 10,
              }}>
              This will permanently delete all copies of this snapshot. This
              action cannot be undone.
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
              onPress={() => setIsDeleteModalVisible(false)}
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
              onPress={() => deleteSnapshotsAlert(selectedSnapshot.id)}
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
                Delete
              </Text>
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
      <Modal
        testID={'modal'}
        isVisible={isModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setModalVisible(false)}
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
            Restore {route.params.slug} from a snapshot
          </Text>
          <View
            style={{
              borderColor: '#AEAEAE',
              borderStyle: 'dashed',
              borderWidth: 1,
              borderRadius: 4,
              padding: 20,
            }}>
            <Text style={{fontSize: 12}}>
              Name: {selectedSnapshot ? selectedSnapshot.name : null}
            </Text>
            <Text style={{fontSize: 12}}>
              Type: {selectedSnapshot ? selectedSnapshot.type : null}
            </Text>
            <Text style={{fontSize: 12}}>
              Date: {selectedSnapshot ? selectedSnapshot.date : null}
            </Text>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 14,
                includeFontPadding: false,
                color: '#000000',
                marginStart: 10,
              }}>
              Here you initiate the restore procedure. This will in effect
              replace this server with the snapshot you choose. The server will
              keep its current IP addresses, profile and alias.
            </Text>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#f44336', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 14,
                includeFontPadding: false,
                color: '#000000',
                marginStart: 10,
              }}>
              <Text style={{fontFamily: 'Raleway-Bold'}}>
                To be sure you know what is happening:
              </Text>{' '}
              Any data not backed up or already snapshot on this server will be
              replaced with the snapshot you choose, and will be lost.
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
              onPress={() => setModalVisible(false)}
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
              onPress={() => restoreThisSnapshot(selectedSnapshot.id)}
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
                Restore
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* <Modal isVisible={isModalVisible2}>
        <View style={styles.content}>
          <View style={{width: '100%'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{textAlign: 'center', paddingStart: 20, fontSize: 18}}>
                Create new snapshot
              </Text>

              <View style={{flexDirection: 'row-reverse'}}>
                <View style={styles.closebutton}>
                  <IconButton
                    icon="close"
                    color="black"
                    size={25}
                    onPress={toggleModal2}
                  />
                </View>
              </View>
            </View>

            <View style={{padding: 20}}>
              <TextInput
                mode="outlined"
                label="Snapshot name"
                value={newSnapshotName}
                onChangeText={newSnapshotName =>
                  setNewSnapshotName(newSnapshotName)
                }
                theme={{
                  colors: {
                    primary: '#00a1a1',
                  },
                }}
              />
            </View>
            <View
              style={{
                padding: 20,
                width: '100%',
              }}>
              <View
                style={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                }}>
                <Button
                  mode="contained"
                  theme={{
                    colors: {
                      primary: '#008570',
                    },
                  }}
                  onPress={() => createSnapshot(newSnapshotName)}>
                  CREATE
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal> */}
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
  icon: {
    width: '10%',
  },
  name: {
    width: '80%',
  },
  status: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
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
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
});
