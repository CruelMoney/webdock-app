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
  TextInput,
  useTheme,
  HelperText,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {
  createAShortLivedTokenForWebSSH,
  createShellUser,
  deleteServerShellUsers,
  getServerShellUsers,
  updateShellUserPublicKeys,
} from '../service/serverShellUsers';
import {deleteServerSnapshot} from '../service/serverSnapshots';
import SelectBox from 'react-native-multi-selectbox';
import Modal, {ReactNativeModal} from 'react-native-modal';
import {xorBy} from 'lodash';
import {getAccountPublicKeys} from '../service/accountPublicKeys';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import ConnectIcon from '../assets/connect-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import PlayIcon from '../assets/play-icon.svg';
import EmptyList from '../components/EmptyList';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import AccordionItem from '../components/AccordionItem';
import ServerSnapshotItem from '../components/ServerSnapshotItem';
import ServerShellUsersItem from '../components/ServerShellUsers';
export default function ServerShellUsers({route, navigation}) {
  const [K_OPTIONS, setkoptions] = useState([]);
  const [shellUsers, setShellUsers] = useState([]);
  const [publicKeys, setPublicKeys] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [inputs, setInputs] = React.useState({
    username: '',
    password: '',
    group: 'sudo',
    shell: '/bin/bash',
    publicKeys: [],
  });
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerShellUsers(userToken, route.params.slug).then(data => {
          setShellUsers(data);
        });
        getAccountPublicKeys(userToken).then(data => {
          setPublicKeys(data);
          setkoptions(
            data.map(item => {
              return {
                id: item.id,
                item: item.name,
              };
            }),
          );
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);

  const updateShellUserPKs = async (pkey, selected) => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var publicKeysId = selected.map(item => {
      return item.id;
    });

    var result = await updateShellUserPublicKeys(
      userToken,
      route.params.slug,
      pkey,
      publicKeysId,
    );
    if (result.status == 202) {
      onBackgroundRefresh();
      try {
        toggleModal();
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Shell user updated!',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
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
        toggleModal();
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server or shell user not found',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const deleteShellUserAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Delete Shell User',
      'Do you really want to delete this shell user?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            var result = await deleteServerShellUsers(
              userToken,
              route.params.slug,
              pkey,
            );
            if (result == 202) {
              onBackgroundRefresh();
              setIsDeleteModalVisible(false);
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Shell user deletion initiated!',
                  visibilityTime: 4000,
                  autoHide: true,
                  onPress: () => navigation.navigate('Events'),
                });
              } catch (e) {
                alert(e);
              }
            } else if (result == 404) {
              setIsDeleteModalVisible(false);

              try {
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Server or shell user not found',
                  visibilityTime: 4000,
                  autoHide: true,
                  onPress: () => navigation.navigate('Events'),
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
  const Item = ({item}) => (
    <>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 10,
          marginBottom: 10,
          display: 'flex',
          padding: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text style={{fontFamily: 'Raleway-Regular', fontSize: 14}}>
            {item.username}
          </Text>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text
              style={{
                fontFamily: 'Raleway-Light',
                fontSize: 12,
                includeFontPadding: false,
                color: '#8F8F8F',
                flexWrap: 'wrap',
              }}>
              {item.created}
            </Text>
          </View>
        </View>
        <View style={{}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              style={{marginHorizontal: 2}}
              onPress={() => {
                openConsoleWithUsername(item.username);
              }}>
              <ConnectIcon
                width={25}
                height={25}
                style={{marginHorizontal: 2}}
              />
            </TouchableOpacity>
            <EditIcon width={25} height={25} style={{marginHorizontal: 2}} />
            <TouchableOpacity
              style={{marginHorizontal: 2}}
              onPress={() => {
                setSelectedShellUser(item);
                setIsDeleteModalVisible(true);
              }}>
              <DeleteIcon fill="#D94B4B" width={25} height={25} />
            </TouchableOpacity>
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
      getServerShellUsers(userToken, route.params.slug).then(data => {
        setShellUsers(data);
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
      getServerShellUsers(userToken, route.params.slug).then(data => {
        setShellUsers(data);
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
    setSelectedTeams(
      item.publicKeys.map(item => {
        return {
          id: item.id,
          item: item.name,
        };
      }),
    );
  };
  const openConsoleWithUsername = async username => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    var result = await createAShortLivedTokenForWebSSH(
      userToken,
      route.params.slug,
      username,
    );
    console.log(result);
    if (result.status == 200) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'WebSSH initiated!',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
        navigation.navigate('ServerConsole', {
          slug: route.params.slug,
          username: username,
          token: result.response.token,
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
  const openConsole = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    var result = await createAShortLivedTokenForWebSSH(
      userToken,
      route.params.slug,
      modalData.username,
    );
    if (result.status == 200) {
      try {
        toggleModal();
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'WebSSH initiated!',
          visibilityTime: 4000,
          autoHide: true,
        });
        navigation.navigate('ServerConsole', {
          slug: route.params.slug,
          username: modalData.username,
          token: result.response.token,
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
  };
  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [selectedShellUser, setSelectedShellUser] = React.useState('');
  const theme = useTheme();
  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.username) {
      handleError('Username is required', 'username');
      isValid = false;
    }
    if (!inputs.password) {
      handleError('Password is required', 'password');
      isValid = false;
    }
    if (!inputs.group) {
      handleError('Group is required', 'group');
      isValid = false;
    }
    if (!inputs.shell) {
      handleError('Shell is required', 'shell');
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
  const sendRequest = async () => {
    let keys = selectedKeys.map(s => s.id);
    handleOnchange(keys, 'publicKeys');
    console.log(inputs);
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createShellUser(
      userToken,
      route.params.slug,
      inputs.username,
      inputs.password,
      inputs.group,
      inputs.shell,
      inputs.publicKeys,
    );
    if (result.status == 202) {
      try {
        setSubmitting(false);
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Shell user creation initiated',
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
  return (
    <>
      <BottomSheetWrapper
        title="Shell users"
        onClose={() => navigation.goBack()}
        style={{backgroundColor: '#F4F8F8', padding: '8%'}}>
        <View
          width="100%"
          height="100%"
          style={{
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}>
          <AccordionItem
            title="Add a Shell User"
            viewKey="AddServerScriptAccordion">
            <View style={{padding: 16, gap: 12}}>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Username
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['username']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'username')}
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
                  onFocus={() => handleError(null, 'username')}
                  error={errors.username}
                />
                {errors.username ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.username}>
                    {errors.username}
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
                  Password
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['password']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'password')}
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
                  onFocus={() => handleError(null, 'password')}
                  error={errors.password}
                />
                {errors.password ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.password}>
                    {errors.password}
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
                  Group
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['group']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'group')}
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
                  onFocus={() => handleError(null, 'group')}
                  error={errors.group}
                />
                {errors.group ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.group}>
                    {errors.group}
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
                  Shell
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['shell']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'shell')}
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
                  onFocus={() => handleError(null, 'shell')}
                  error={errors.shell}
                />
                {errors.shell ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.shell}>
                    {errors.shell}
                  </HelperText>
                ) : null}
              </View>
              <View style={{gap: 4}}>
                <SelectBox
                  list
                  label="Select public keys you want to assign to this user"
                  options={K_OPTIONS}
                  multiOptionContainerStyle={{
                    backgroundColor: '#008570',
                  }}
                  listOptionProps={{
                    style: {maxHeight: '100%'},
                  }}
                  labelStyle={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 12,
                    color: theme.colors.text,
                  }}
                  selectedItemStyle={{
                    color: theme.colors.text,
                  }}
                  inputFilterStyle={{
                    color: theme.colors.text,
                  }}
                  optionsLabelStyle={{color: theme.colors.text}}
                  multiOptionsLabelStyle={{color: theme.colors.text}}
                  arrowIconColor={theme.colors.text}
                  searchIconColor={theme.colors.text}
                  toggleIconColor={theme.colors.text}
                  selectedValues={selectedKeys}
                  onMultiSelect={onMultiChange2()}
                  onTapClose={onMultiChange2()}
                  isMulti
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
                  Add user
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
                Existing Shell Users
              </Text>
            </View>
            <FlatList
              data={shellUsers}
              showsVerticalScrollIndicator={false}
              onRefresh={() => onRefresh()}
              refreshing={isFetching}
              ListEmptyComponent={
                shellUsers ? (
                  shellUsers.length == 0 ? (
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
                        You do not have any shell user yet.
                      </Text>
                    </View>
                  ) : null
                ) : null
              }
              ListFooterComponent={<View style={{height: 60}}></View>}
              renderItem={({item}) => (
                <View>
                  <ServerShellUsersItem
                    item={item}
                    onRequestConnect={() =>
                      openConsoleWithUsername(item.username)
                    }
                    onRequestDelete={() => {
                      setSelectedShellUser(item);
                      setIsDeleteModalVisible(true);
                    }}
                    onRequestEdit={() => modalOpen(item)}
                  />
                  <View style={{height: 1}}></View>
                </View>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </BottomSheetWrapper>
      <ReactNativeModal isVisible={isModalVisible}>
        <View style={styles.content}>
          <View style={{width: '100%'}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  paddingStart: 20,
                  fontFamily: 'Raleway-Medium',
                  marginTop: 10,
                  fontSize: 18,
                }}>
                {modalData ? modalData.username : ''}
              </Text>
            </View>
          </View>
          <View style={{padding: 20}}>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Username: </Text>
              {modalData ? modalData.username : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Created: </Text>
              {modalData ? modalData.created : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Group: </Text>
              {modalData ? modalData.group : ''}
            </Text>
            <Text>
              <Text style={{fontWeight: 'bold'}}>Shell: </Text>
              {modalData ? modalData.shell : ''}
            </Text>

            <SelectBox
              label="Select public keys you want to assign to this user"
              options={K_OPTIONS}
              multiOptionContainerStyle={{
                backgroundColor: '#008570',
              }}
              arrowIconColor="#008570"
              searchIconColor="#008570"
              toggleIconColor="#008570"
              selectedValues={selectedTeams}
              onMultiSelect={onMultiChange()}
              onTapClose={onMultiChange()}
              isMulti
            />

            <TouchableOpacity onPress={openConsole}>
              <View
                style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
                <View style={{backgroundColor: '#03A84E', width: 1}}></View>
                <View>
                  <Text
                    style={{
                      fontFamily: 'Raleway-Bold',
                      fontSize: 14,
                      color: '#5F5F5F',
                      marginStart: 10,
                    }}>
                    Connect now in your browser:
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Raleway-Regular',
                      fontSize: 12,
                      color: '#039be5',
                      marginStart: 10,
                    }}>
                    Click to connect with our Web SSH Terminal
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              padding: 20,
              width: '100%',
            }}>
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
                onPress={() => toggleModal()}
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
                onPress={() => updateShellUserPKs(modalData.id, selectedTeams)}
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
                  Assign
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ReactNativeModal>
      {/* Delete Snapshot Modal */}
      <ReactNativeModal
        testID={'modal'}
        isVisible={isDeleteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={() => setIsDeleteModalVisible(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
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
            Delete user {selectedShellUser ? selectedShellUser.username : null}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: theme.colors.text,
            }}>
            Please confirm you want to delete this shell user
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View style={{backgroundColor: '#D94B4B', width: 3}}></View>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                includeFontPadding: false,
                color: '#000000',
                marginStart: 10,
              }}>
              Warning: As is standard behavior in Linux, all data in this users
              home directory will be deleted. Please make sure you have not
              placed any important files there you want to keep.
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
              onPress={() => deleteShellUserAlert(selectedShellUser.id)}>
              Delete user
            </Button>
          </View>
        </View>
      </ReactNativeModal>
    </>
  );

  function onMultiChange() {
    return item => setSelectedTeams(xorBy(selectedTeams, [item], 'id'));
  }

  function onMultiChange2() {
    return item => setSelectedKeys(xorBy(selectedKeys, [item], 'id'));
  }
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
});
