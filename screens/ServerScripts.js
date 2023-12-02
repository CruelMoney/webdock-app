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
  Checkbox,
  TextInput,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {
  createServerScript,
  deleteServerScript,
  executeServerScript,
  getServerScripts,
} from '../service/serverScripts';
import {getAccountScripts} from '../service/accountScripts';
import Modal from 'react-native-modal';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import PlayIcon from '../assets/play-icon.svg';
import EmptyList from '../components/EmptyList';
export default function ServerScripts({route, navigation}) {
  const [serverScripts, setScripts] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerScripts(userToken, route.params.slug).then(data => {
          setScripts(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);

  const [callbackId, setCallbackId] = useState();

  const [visibleSnack, setVisibleSnack] = useState(false);

  const onToggleSnackBar = () => setVisibleSnack(!visibleSnack);

  const onDismissSnackBar = () => setVisibleSnack(false);

  const deleteScriptAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');
    var result = await deleteServerScript(userToken, route.params.slug, pkey);

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
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Script not found',
          visibilityTime: 4000,
          autoHide: true,
        });
        setIsDeleteModalVisible(false);
      } catch (e) {
        alert(e);
      }
    }
  };
  const Item = ({item}) => (
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
        <View style={{width: '80%'}}>
          <Text style={{fontFamily: 'Raleway-Regular', fontSize: 12}}>
            {item.name}
          </Text>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text
              style={{
                width: 100,
                fontFamily: 'Raleway-Light',
                fontSize: 10,
                color: '#8F8F8F',
              }}>
              {item.path}
            </Text>
          </View>
        </View>
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <View style={{display: 'flex', flexDirection: 'row', width: '20%'}}>
            <View
              style={{
                width: 25,
                height: 25,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(76,159,90,0.26)',
                borderRadius: 25 / 2,
              }}>
              <TouchableOpacity onPress={() => setIsExecuteModalVisible(true)}>
                <Icon name="play-arrow" size={20} color="#4C9F5A" />
              </TouchableOpacity>
            </View>
            <View style={{width: 10}}></View>
            <TouchableOpacity
              onPress={() => {
                setIsDeleteModalVisible(true);
                setSelectedScript(item);
              }}>
              <DeleteIcon fill="#D94B4B" width={25} height={25} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerScripts(userToken, route.params.slug).then(data => {
        setScripts(data);
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
      getServerScripts(userToken, route.params.slug).then(data => {
        setScripts(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [isModalVisible, setModalVisible] = useState();
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [modalData, setModalData] = useState();
  const modalOpen = item => {
    toggleModal();
    setModalData(item);
  };

  const runScript = async scriptId => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await executeServerScript(
      userToken,
      route.params.slug,
      scriptId,
    );
    if (result.status == 202) {
      try {
        setIsExecuteModalVisible(false);
        setCallbackId(result.headers.get('x-callback-id'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 404) {
      try {
        setIsExecuteModalVisible(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Script not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const [isModalVisible2, setModalVisible2] = useState();
  const toggleModal2 = () => {
    setModalVisible2(!isModalVisible2);
  };
  const [selectedScript, setSelectedScript] = React.useState('');

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [isExecuteModalVisible, setIsExecuteModalVisible] = React.useState(
    false,
  );
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
          data={serverScripts}
          style={{marginTop: 20}}
          showsVerticalScrollIndicator={false}
          onRefresh={() => onRefresh()}
          refreshing={isFetching}
          ListFooterComponent={<View style={{height: 60}}></View>}
          renderItem={({item}) => (
            <TouchableOpacity>
              <View>
                <Item item={item} />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={<EmptyList />}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateServerScript')}
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
      {/* Delete Server Script Modal */}
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
            Remove script {selectedScript ? selectedScript.name : null}
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Please confirm you want to remove this script
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
              onPress={() => deleteScriptAlert(selectedScript.id)}
              style={{
                width: '45%',
                height: 40,
                backgroundColor: '#D94B4B',
                borderRadius: 4,
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  includeFontPadding: false,
                  fontFamily: 'Raleway-Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Execute Server Script Modal */}
      <Modal
        testID={'modal'}
        isVisible={isExecuteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setIsExecuteModalVisible(false)}
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
            Execute script {selectedScript ? selectedScript.name : null}
          </Text>
          <Text
            style={{
              fontFamily: 'Raleway-Regular',
              fontSize: 12,
              color: '#000000',
              marginVertical: 10,
            }}>
            Please confirm you want to execute this script
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
              onPress={() => setIsExecuteModalVisible(false)}
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
              onPress={() => runScript(selectedScript.id)}
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
                Execute
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal isVisible={isModalVisible}>
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
                {modalData ? modalData.name : ''}
              </Text>

              <View style={{flexDirection: 'row-reverse'}}>
                <View style={styles.closebutton}>
                  <IconButton
                    icon="close"
                    color="black"
                    size={25}
                    onPress={toggleModal}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={{padding: 20}}>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Name: </Text>
              {modalData ? modalData.name : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Path: </Text>
              {modalData ? modalData.path : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Created: </Text>
              {modalData ? modalData.created : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Last run: </Text>
              {modalData ? modalData.lastRun : ''}
            </Text>
          </View>
          <View
            style={{
              padding: 20,
              width: '100%',
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                mode="contained"
                icon="delete"
                theme={{
                  colors: {
                    primary: '#F44336',
                  },
                }}
                onPress={() => {
                  deleteScriptAlert(modalData.id);
                }}>
                Delete
              </Button>
              <Button
                mode="contained"
                icon="play"
                theme={{
                  colors: {
                    primary: '#008570',
                  },
                }}
                onPress={() => {
                  runScript(modalData.id);
                }}>
                RUN
              </Button>
            </View>
          </View>
        </View>
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
  closebutton: {
    alignItems: 'flex-end',
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
