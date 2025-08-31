import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useRef, useEffect, useState} from 'react';
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
  Keyboard,
  InteractionManager,
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
  useTheme,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import Modal, {ReactNativeModal} from 'react-native-modal';
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
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import ServerSnapshotItem from '../components/ServerSnapshotItem';
import AccordionItem from '../components/AccordionItem';
import {setGlobalCallbackId} from '../service/storageEvents';
export default function ServerSnapshots({route, navigation}) {
  const serverSnapshotsCache = useRef(null);
  const [serverSnapshots, setServerSnapshots] = useState();
  useEffect(() => {
    setIsFetching(true);

    const unsubscribe = navigation.addListener('focus', async () => {
      if (serverSnapshotsCache.current) {
        setServerSnapshots(serverSnapshotsCache.current);
      } else {
        await fetchSnapshots();
      }
    });

    const task = InteractionManager.runAfterInteractions(() => {
      (async () => {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          const data = await getServerSnapshots(userToken, route.params.slug);
          setServerSnapshots(data);
          setIsFetching(false);
        } catch (e) {
          setIsFetching(false);
          alert(e);
        }
      })();
    });

    return () => {
      task.cancel(); // Cancel deferred task if component unmounts
      unsubscribe(); // Clean up the focus listener
    };
  }, [route]);

  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerSnapshots(userToken, route.params.slug).then(data => {
        setServerSnapshots(data);
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
        setServerSnapshots(data);
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
          text1: 'Server or snapshot not found!',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
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
        await setGlobalCallbackId(result.headers.get('x-callback-id'));

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
  const theme = useTheme();

  const [inputs, setInputs] = React.useState({
    name: '',
    filename: '',
    content: '',
  });
  const [errors, setErrors] = React.useState({});
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createSnapshotForServer(
      userToken,
      route.params.slug,
      inputs.name,
    );
    if (result.status == 202) {
      try {
        setCallbackId(result.headers.get('X-Callback-ID'));
        await setGlobalCallbackId(result.headers.get('x-callback-id'));
        setVisibleSnack(true);
      } catch (e) {
        alert(e);
      }
      navigation.goBack();
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
    }
  };

  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.name) {
      handleError('Snapshot name is required', 'name');
      isValid = false;
    }

    if (isValid) {
      sendRequest();
    } else {
      setSubmitting(false);
    }
  };
  const handleOnchange = (text, input) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };
  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };
  const [submitting, setSubmitting] = useState(false);
  return (
    <>
      <BottomSheetWrapper title="Snapshots" onClose={() => navigation.goBack()}>
        <View
          width="100%"
          height="100%"
          style={{
            minHeight: '100%',
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}>
          <AccordionItem
            title="Create new snapshot"
            viewKey="AddServerScriptAccordion">
            <View style={{padding: 16, gap: 12}}>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Snapshot name
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['name']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'name')}
                  underlineColorAndroid="transparent"
                  activeUnderlineColor="transparent"
                  underlineColor="transparent"
                  cursorColor="#fff"
                  theme={{
                    colors: {
                      background: '#fff',
                      surface: '#fff',
                      text: '#000',
                      primary: '#000',
                      placeholder: '#999',
                    },
                  }}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#D9D9D9',
                    fontFamily: 'Poppins-Light',
                    fontSize: 14,
                  }}
                  onFocus={() => handleError(null, 'name')}
                  error={errors.name}
                />
                {errors.name ? (
                  <HelperText type="error" padding="none" visible={errors.name}>
                    {errors.name}
                  </HelperText>
                ) : null}
              </View>
              <View
                style={{
                  justifyContent: 'flex-end',
                }}>
                {/* add public key button */}
                <Button
                  mode="contained"
                  textColor="black"
                  compact
                  style={{
                    borderRadius: 4,
                    minWidth: 0,
                    paddingHorizontal: 8,
                  }}
                  labelStyle={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    lineHeight: 14 * 1.2,
                    fontWeight: '600',
                  }}
                  onPress={validate}>
                  Create new snapshot
                </Button>
              </View>
            </View>
          </AccordionItem>
          <View>
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
                Server Snapshots
              </Text>
            </View>
            <FlatList
              data={serverSnapshots}
              // onRefresh={() => onRefresh()}
              scrollEnabled={false}
              // refreshing={isFetching}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{height: 60}}></View>}
              renderItem={({item}) => (
                <>
                  <ServerSnapshotItem
                    item={item}
                    onRequestDelete={() => {
                      setSelectedSnapshot(item);
                      setIsDeleteModalVisible(true);
                    }}
                    onRequestEdit={() => modalOpen(item)}
                  />
                  <View
                    style={{
                      height: 1,
                    }}></View>
                </>
              )}
              ListHeaderComponent={
                isFetching ? (
                  <View
                    style={{
                      alignItems: 'center',
                      padding: 14,
                      gap: 16,
                      backgroundColor: theme.colors.surface,
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                    }}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                    <Text
                      style={{
                        marginTop: 8,
                        fontFamily: 'Poppins',
                        fontSize: 12,
                        color: theme.colors.primary,
                      }}>
                      Loading snapshots...
                    </Text>
                  </View>
                ) : null
              }
              keyExtractor={item => item.id}
              ListEmptyComponent={
                serverSnapshots &&
                serverSnapshots.length === 0 &&
                !isFetching ? (
                  <View
                    style={{
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                      padding: 14,
                      backgroundColor: theme.colors.surface,
                    }}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        fontFamily: 'Poppins',
                        fontSize: 14,
                      }}>
                      This server doesn't have any snapshot yet.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </BottomSheetWrapper>
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
            padding: 24,
            borderTopStartRadius: 20,
            borderTopEndRadius: 20,
            gap: 12,
            backgroundColor: theme.colors.surface,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18,
              color: theme.colors.accent,
            }}>
            Are you sure you want to remove snapshot “
            {selectedSnapshot ? selectedSnapshot.name : null}” from this server?
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: theme.colors.text,
            }}>
            Please confirm you want to delete this snapshot
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View
              style={{backgroundColor: theme.colors.primary, width: 3}}></View>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
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
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <Button
              mode="outlined"
              textColor={theme.colors.text}
              compact
              style={{
                borderColor: '#00956c',
                borderRadius: 4,
                width: '50%',
                paddingHorizontal: 8,
              }}
              labelStyle={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                fontWeight: '600',
                includeFontPadding: false,
              }}
              onPress={() => setIsDeleteModalVisible(false)}>
              Cancel
            </Button>
            <Button
              mode="contained"
              textColor={'white'}
              compact
              style={{
                width: '50%',
                borderRadius: 4,
                minWidth: 0,
                backgroundColor: '#D34646',
              }}
              labelStyle={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                fontWeight: '600',
              }}
              onPress={() => deleteSnapshotsAlert(selectedSnapshot.id)}>
              Delete snapshot
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
      <ReactNativeModal
        testID={'modal'}
        isVisible={isModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setModalVisible(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 24,
            borderTopStartRadius: 20,
            borderTopEndRadius: 20,
            gap: 12,
            backgroundColor: theme.colors.surface,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18,
              color: theme.colors.text,
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
            <Text style={{fontSize: 12, color: theme.colors.text}}>
              Name: {selectedSnapshot ? selectedSnapshot.name : null}
            </Text>
            <Text style={{fontSize: 12, color: theme.colors.text}}>
              Type: {selectedSnapshot ? selectedSnapshot.type : null}
            </Text>
            <Text style={{fontSize: 12, color: theme.colors.text}}>
              Date: {selectedSnapshot ? selectedSnapshot.date : null}
            </Text>
          </View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                color: theme.colors.text,
                marginStart: 10,
              }}>
              Here you initiate the restore procedure. This will in effect
              replace this server with the snapshot you choose. The server will
              keep its current IP addresses, profile and alias.
            </Text>
          </View>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <View style={{backgroundColor: '#f44336', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Poppins-Light',
                fontSize: 12,
                color: theme.colors.text,
                marginStart: 10,
              }}>
              <Text style={{fontFamily: 'Poppins-Bold'}}>
                To be sure you know what is happening:
              </Text>{' '}
              Any data not backed up or already snapshot on this server will be
              replaced with the snapshot you choose, and will be lost.
            </Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <Button
              mode="outlined"
              textColor={theme.colors.text}
              compact
              style={{
                backgroundColor: 'white',
                borderColor: '#00956c',
                borderRadius: 4,
                width: '50%',
                paddingHorizontal: 8,
              }}
              labelStyle={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                fontWeight: '600',
                includeFontPadding: false,
                color: 'black',
              }}
              onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
            <Button
              mode="contained"
              textColor={'white'}
              compact
              style={{
                width: '50%',
                borderRadius: 4,
                minWidth: 0,
                backgroundColor: '#449ADF',
              }}
              labelStyle={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 14,
                fontWeight: '600',
              }}
              onPress={() => restoreThisSnapshot(selectedSnapshot.id)}>
              Restore
            </Button>
          </View>
        </View>
      </ReactNativeModal>
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
