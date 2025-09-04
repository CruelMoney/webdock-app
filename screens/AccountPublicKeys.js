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
  Pressable,
  Keyboard,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  TextInput,
  HelperText,
  IconButton,
  useTheme,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {
  getAccountPublicKeys,
  postAccountPublicKeys,
} from '../service/accountPublicKeys';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';
import Modal, {ReactNativeModal} from 'react-native-modal';
import Toast from 'react-native-toast-message';
import MenuIcon from '../assets/menu-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import DeleteIcon from '../assets/delete-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import EmptyList from '../components/EmptyList';
import PublicKeysItem from '../components/PublicKeysItem';
import {useSharedValue} from 'react-native-reanimated';
import AccordionItem from '../components/AccordionItem';
import GradientButton from '../components/GradientButton';
import BottomSheetWrapper from '../components/BottomSheetWrapper';

export default function AccountPublicKeys({navigation}) {
  const publicKeysCache = useRef(null);
  const [publicKeys, setPublicKeys] = useState([]);
  const [inputs, setInputs] = React.useState({
    name: '',
    key: '',
  });
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (publicKeysCache.current) {
        setPublicKeys(publicKeysCache.current);
      } else {
        await fetchPublicKeys();
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchPublicKeys = async () => {
    setIsFetching(true);
    try {
      let userToken = null;
      userToken = await AsyncStorage.getItem('userToken');
      const data = await getAccountPublicKeys(userToken);
      setPublicKeys(data);
      publicKeysCache.current = data;
    } catch (e) {
      alert(e);
    } finally {
      setIsFetching(false);
    }
  };

  const deletePublicKeyAlert = async pkey => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    deleteAccountPublicKey(userToken, pkey);
    onBackgroundRefresh();
    setIsDeleteModalVisible(false);
  };

  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    publicKeysCache.current = null;
    await fetchPublicKeys();
  };
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getAccountPublicKeys(userToken).then(data => {
        setPublicKeys(data);
      });
      console.log(publicKeys);
    } catch (e) {
      alert(e);
    }
  };

  const EmptyListMessage = ({item}) => {
    return <Text style={styles.emptyListStyle}>No Data Found</Text>;
  };

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [selectedPublicKey, setSelectedPublicKey] = React.useState('');
  const handleRequestDelete = key => {
    setSelectedPublicKey(key);
    setIsDeleteModalVisible(true);
  };
  const theme = useTheme();
  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.name) {
      handleError('Key name is required', 'name');
      isValid = false;
    }

    if (!inputs.key) {
      handleError('Public Key is required', 'key');
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
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await postAccountPublicKeys(
      userToken,
      inputs['name'],
      inputs['key'],
    );
    if (result.status == 201) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'PublicKey created',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
        setSubmitting(false);
        onBackgroundRefresh();
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
        setSubmitting(false);
      } catch (e) {
        alert(e);
      }
    }
  };
  const handleClick = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <BottomSheetWrapper
        title="Public Keys"
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
            title="Add new public key"
            viewKey="PublicKeyAccordion">
            <View style={{padding: 16, gap: 12}}>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Your name
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['name']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'name')}
                  underlineColorAndroid="transparent"
                  underlineStyle={{display:'none'}}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.text}
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
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Your public key
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['key']}
                  onChangeText={text => handleOnchange(text, 'key')}
                  dense={true}
                  multiline
                  underlineColorAndroid="transparent"
                  underlineStyle={{display:'none'}}
                  underlineColor="transparent"
                  activeUnderlineColor={theme.colors.text}
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
                  onFocus={() => handleError(null, 'key')}
                  error={errors.key}
                />
                {errors.key ? (
                  <HelperText type="error" padding="none" visible={errors.key}>
                    {errors.key}
                  </HelperText>
                ) : null}
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <View style={{backgroundColor: '#01FF48', width: 3}}></View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Light',
                    fontSize: 12,
                    color: '#869486',
                    marginStart: 10,
                  }}>
                  This will add a globally available SSH Public Key to your
                  account which you can assign to any of your shell users.
                </Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <View style={{backgroundColor: '#FFEB3B', width: 3}}></View>
                <View>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Light',
                      fontSize: 12,
                      color: '#869486',
                      marginStart: 10,
                    }}>
                    Please omit any comments and begin / end markers in your
                    Public key. Just paste the key itself.
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleClick(
                        'https://webdock.io/en/docs/webdock-control-panel/shell-users-and-sudo/set-up-an-ssh-key',
                      )
                    }>
                    <Text
                      style={{
                        fontFamily: 'Raleway-Regular',
                        fontSize: 12,
                        color: '#039BE5',
                        marginStart: 10,
                      }}>
                      Click here to see how a proper key is formatted
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View
                style={{
                  justifyContent: 'flex-end',
                }}>
                {/* add public key button */}
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
                  onPress={validate}>
                  Add public key
                </Button>
                {/* <Pressable onPress={validate}>
                  <GradientButton
                    text="Add public key"
                    submitting={submitting}
                  />
                </Pressable> */}
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
                Public keys
              </Text>
            </View>
            <FlatList
              style={{}}
              data={publicKeys}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              onRefresh={() => onRefresh()}
              refreshing={isFetching}
              renderItem={({item}) => (
                <>
                  <PublicKeysItem
                    item={item}
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
                publicKeys && publicKeys.length === 0 && !isFetching ? (
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
                      You do not have any saved Public Keys yet.
                    </Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </BottomSheetWrapper>
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
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18,
              color: theme.colors.accent,
            }}>
            Are you sure you want to remove the public key “
            {selectedPublicKey ? selectedPublicKey.name : null}” from your
            account?
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              color: theme.colors.text,
            }}>
            Please confirm you want to remove this public key
          </Text>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 10}}>
            <View
              style={{backgroundColor: theme.colors.primary, width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                color: theme.colors.text,
                marginStart: 10,
              }}>
              This will not remove any keys from any of your servers. You are
              simply removing this public key from the globally available keys
              saved against your user account.
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
              onPress={() => deletePublicKeyAlert(selectedPublicKey.id)}>
              Delete Key
            </Button>
          </View>
        </View>
      </ReactNativeModal>
    </>
  );
}
const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 5,
  },
  name: {
    width: '85%',
  },
  status: {
    width: '15%',
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
  closebutton: {
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
