import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Keyboard,
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
  useTheme,
  HelperText,
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
import Modal, {ReactNativeModal} from 'react-native-modal';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import PlayIcon from '../assets/play-icon.svg';
import EmptyList from '../components/EmptyList';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import AccordionItem from '../components/AccordionItem';
import {Picker} from '@react-native-picker/picker';
import ScriptItem from '../components/ScriptItem';
import ServerScriptItem from '../components/ServerScriptItem';
export default function ServerScripts({route, navigation}) {
  const [serverScripts, setScripts] = useState();
  const [inputs, setInputs] = React.useState({
    selectedScript: '',
    path: '',
  });
  const [modifiedScripts, setModifiedScripts] = useState([]);
  const [errors, setErrors] = React.useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerScripts(userToken, route.params.slug).then(data => {
          console.log(data);
          setScripts(data);
        });
        getAccountScripts(userToken).then(data => {
          var array = [];
          data.map(item => {
            array.push({
              label: item.name,
              value: item.id,
              key: item.id,
              filename: item.filename,
            });
          });
          setModifiedScripts(array);
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
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Script deleted',
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
          text1: 'Script not found',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
        setIsDeleteModalVisible(false);
      } catch (e) {
        alert(e);
      }
    }
  };

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
      getAccountScripts(userToken).then(data => {
        var array = [];
        data.map(item => {
          array.push({
            label: item.name,
            value: item.id,
            key: item.id,
            filename: item.filename,
          });
        });
        setModifiedScripts(array);
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
          onPress: () => navigation.navigate('Events'),
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
  const [isExecuteModalVisible, setIsExecuteModalVisible] =
    React.useState(false);

  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.path) {
      handleError('Script path is required', 'path');
      isValid = false;
    }
    if (!inputs.selectedScript) {
      handleError('You need to select one script!', 'selectedScript');
      isValid = false;
    }

    if (isValid) {
      sendRequest();
    } else {
      setSubmitting(false);
    }
  };
  const handleOnchange = (text, input, filename) => {
    setInputs(prevState => ({...prevState, ['path']: '/root/' + filename}));
    setInputs(prevState => ({...prevState, [input]: text}));
  };
  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };
  const [checkedExecutable, setCheckedExecutable] = React.useState(false);
  const [checkedRunThisNow, setCheckedRunThisNow] = React.useState(false);

  const theme = useTheme();

  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createServerScript(
      userToken,
      route.params.slug,
      inputs.selectedScript,
      inputs.path,
    );
    if (result.status == 202) {
      try {
        setSubmitting(false);
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Script deployed',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
      navigation.goBack();
    } else if (result.status == 400) {
      try {
        setSubmitting(false);
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
        setSubmitting(false);
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
  const [submitting, setSubmitting] = useState(false);
  const handleRequestDelete = key => {
    setSelectedScript(key);
    setIsDeleteModalVisible(true);
  };
  const handleRequestExecute = key => {
    setSelectedScript(key);
    setIsExecuteModalVisible(true);
  };
  return (
    <>
      <BottomSheetWrapper
        title="Server scripts"
        onClose={() => navigation.goBack()}>
        <View
          width="100%"
          height="100%"
          style={{
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}>
          <AccordionItem
            title="Deploy new script"
            viewKey="AddServerScriptAccordion">
            <View style={{padding: 16, gap: 12}}>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Choose a file or script
                </Text>
                <View
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#D9D9D9',
                    height: 45,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Picker
                    selectedValue={inputs['selectedScript']}
                    style={{
                      width: '100%',
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                      color: theme.colors.text,
                      includeFontPadding: false,
                    }}
                    useNativeAndroidPickerStyle={false}
                    textInputProps={{underlineColorAndroid: 'cyan'}}
                    dropdownIconColor={theme.colors.text}
                    onValueChange={(itemValue, itemIndex) => {
                      handleOnchange(
                        itemValue,
                        'selectedScript',
                        modifiedScripts[itemIndex].filename,
                      );
                    }}>
                    {modifiedScripts.map(item => (
                      <Picker.Item
                        label={item.label}
                        value={item.value}
                        key={item.key}
                      />
                    ))}
                  </Picker>
                </View>
                {errors.selectedScript ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.selectedScript}>
                    {errors.selectedScript}
                  </HelperText>
                ) : null}
              </View>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Absolute path and filename on server
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['path']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'path')}
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
                  onFocus={() => handleError(null, 'path')}
                  error={errors.path}
                />
                {errors.path ? (
                  <HelperText type="error" padding="none" visible={errors.path}>
                    {errors.path}
                  </HelperText>
                ) : null}
              </View>
              <View style={{gap: 16, flexDirection: 'row'}}>
                <Checkbox.Item
                  labelStyle={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 12,
                    color: theme.colors.text,
                  }}
                  position="leading"
                  style={{paddingHorizontal: 0}}
                  status={checkedExecutable ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setCheckedExecutable(!checkedExecutable);
                  }}
                  color={theme.colors.primary}
                  label="Make file executable"
                />
                <Checkbox.Item
                  labelStyle={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 12,
                    color: theme.colors.text,
                  }}
                  position="leading"
                  style={{paddingHorizontal: 0}}
                  status={checkedRunThisNow ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setCheckedRunThisNow(!checkedRunThisNow);
                  }}
                  color={theme.colors.primary}
                  label="Run script now"
                />
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
                  Deploy this script
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
                Added scripts
              </Text>
            </View>
            <FlatList
              style={{}}
              data={serverScripts}
              showsVerticalScrollIndicator={false}
              onRefresh={() => onRefresh()}
              refreshing={isFetching}
              renderItem={({item}) => (
                <>
                  <ServerScriptItem
                    item={item}
                    onRequestEdit={handleRequestExecute}
                    onRequestDelete={handleRequestDelete}
                  />
                  <View
                    style={{
                      height: 1,
                    }}></View>
                </>
              )}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                serverScripts ? (
                  serverScripts.length == 0 ? (
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
                        You do not have any deployed script yet.
                      </Text>
                    </View>
                  ) : null
                ) : null
              }
            />
          </View>
        </View>
      </BottomSheetWrapper>
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
      <ReactNativeModal
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
              color: theme.colors.text,
            }}>
            Are you sure you want to remove script “
            {selectedScript ? selectedScript.name : null}” from your account?
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: theme.colors.text,
            }}>
            Please confirm you want to remove this script
          </Text>
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
              onPress={() => deleteScriptAlert(selectedScript.id)}>
              Delete script
            </Button>
          </View>
        </View>
      </ReactNativeModal>
      {/* Execute Server Script Modal */}
      <ReactNativeModal
        testID={'modal'}
        isVisible={isExecuteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setIsExecuteModalVisible(false)}
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
            Execute script {selectedScript ? selectedScript.name : null}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: theme.colors.text,
            }}>
            Please confirm you want to execute this script
          </Text>
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
                borderColor: '#022213',
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
              onPress={() => setIsExecuteModalVisible(false)}>
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
              onPress={() => runScript(selectedScript.id)}>
              Execute
            </Button>
          </View>
        </View>
      </ReactNativeModal>
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
