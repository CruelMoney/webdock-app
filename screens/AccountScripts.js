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
  Pressable,
  TouchableOpacity,
  Alert,
  Keyboard,
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
  IconButton,
  useTheme,
  TextInput,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {
  deleteAccountScript,
  getAccountScripts,
  patchAccountScripts,
  postAccountScripts,
} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import ReactNativeModal from 'react-native-modal';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import EmptyList from '../components/EmptyList';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
import ScriptItem from '../components/ScriptItem';
import AccordionItem from '../components/AccordionItem';

export default function AccountScripts({navigation}) {
  const [scripts, setScripts] = useState();
  const [inputs, setInputs] = React.useState({
    name: '',
    filename: '',
    content: '',
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
        getAccountScripts(userToken).then(data => {
          setScripts(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [navigation]);

  const deleteScriptAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');
    var result = await deleteAccountScript(userToken, pkey);
    if (result == 200) {
      onBackgroundRefresh();
      try {
        setIsDeleteModalVisible(false);
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Script successfully deleted',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
    } else if (result == 404) {
      try {
        setIsDeleteModalVisible(false);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Script not found',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
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
      getAccountScripts(userToken).then(data => {
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
      getAccountScripts(userToken).then(data => {
        setScripts(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [isDeleteModalVisible, setIsDeleteModalVisible] = React.useState(false);
  const [selectedScript, setSelectedScript] = React.useState();
  const theme = useTheme();
  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.name) {
      handleError('Descriptive name is required', 'name');
      isValid = false;
    }

    if (!inputs.filename) {
      handleError('Filename is required', 'key');
      isValid = false;
    }
    if (!inputs.content) {
      handleError('File content is required', 'content');
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
  const handleRequestDelete = key => {
    setSelectedScript(key);
    setIsDeleteModalVisible(true);
  };
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await postAccountScripts(
      userToken,
      inputs.name,
      inputs.filename,
      inputs.content,
    );
    if (result.status == 201) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Account script added',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
      onBackgroundRefresh();
      setInputs({name: '', filename: '', content: ''});
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

  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <BottomSheetWrapper title="Scripts" onClose={() => navigation.goBack()}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}>
          <AccordionItem
            title="Add new script"
            viewKey="AddAccountScriptAccordion">
            <View style={{padding: 16, gap: 12}}>
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Descriptive name
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
              <View style={{gap: 4}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}>
                  Filename
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['filename']}
                  dense={true}
                  onChangeText={text => handleOnchange(text, 'filename')}
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
                  onFocus={() => handleError(null, 'filename')}
                  error={errors.filename}
                />
                {errors.filename ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.filename}>
                    {errors.filename}
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
                  File contents
                </Text>
                <TextInput
                  mode="flat"
                  value={inputs['content']}
                  onChangeText={text => handleOnchange(text, 'content')}
                  dense={true}
                  multiline
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
                  onFocus={() => handleError(null, 'content')}
                  error={errors.content}
                />
                {errors.content ? (
                  <HelperText
                    type="error"
                    padding="none"
                    visible={errors.content}>
                    {errors.content}
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
                  Add script
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
              data={scripts}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              onRefresh={() => onRefresh()}
              refreshing={isFetching}
              renderItem={({item}) => (
                <>
                  <ScriptItem
                    item={item}
                    onRequestEdit={item => {
                      console.log(item);
                      navigation.navigate('EditAccountScript', item);
                    }}
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
                scripts ? (
                  scripts.length == 0 ? (
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
            backgroundColor: theme.colors.surface,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 18,
              color: theme.colors.accent,
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
              onPress={() => deleteScriptAlert(selectedScript.id)}>
              Delete script
            </Button>
          </View>
        </View>
      </ReactNativeModal>
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
    width: '90%',
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
