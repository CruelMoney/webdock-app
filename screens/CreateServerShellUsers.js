import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Keyboard,
} from 'react-native';
import {
  IconButton,
  Button,
  Divider,
  HelperText,
  Snackbar,
  Checkbox,
} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import {
  getAccountPublicKeys,
  postAccountPublicKeys,
} from '../service/accountPublicKeys';
import {getAccountScripts, postAccountScripts} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import {
  createServerScript,
  executeServerScript,
  getServerScripts,
} from '../service/serverScripts';
import {TouchableOpacity} from 'react-native-gesture-handler';
import GradientButton from '../components/GradientButton';
import BackIcon from '../assets/back-icon.svg';
import {Picker} from '@react-native-picker/picker';
import SelectBox from 'react-native-multi-selectbox';
import {xorBy} from 'lodash';
import {createShellUser} from '../service/serverShellUsers';

export default function CreateServerShellUsers({route, navigation}) {
  const [inputs, setInputs] = React.useState({
    username: '',
    password: '',
    group: 'sudo',
    shell: '/bin/bash',
    publicKeys: [],
  });
  const [K_OPTIONS, setkoptions] = useState();
  const [publicKeys, setPublicKeys] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
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
  function onMultiChange() {
    return item => setSelectedTeams(xorBy(selectedTeams, [item], 'id'));
  }

  function onMultiChange2() {
    return item => setSelectedKeys(xorBy(selectedKeys, [item], 'id'));
  }
  const [submitting, setSubmitting] = useState(false);
  return (
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
          }}>
          Create shell user
        </Text>
        <View style={{width: 50}}></View>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <View style={{marginTop: 25}}>
            <TextInput
              mode="outlined"
              label="Username"
              value={inputs['username']}
              onChangeText={text => handleOnchange(text, 'username')}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              onFocus={() => handleError(null, 'username')}
              error={errors.username}
            />
            <HelperText type="error" visible={errors.username}>
              {errors.username}
            </HelperText>
            <TextInput
              mode="outlined"
              label="Password"
              value={inputs['password']}
              onChangeText={text => handleOnchange(text, 'password')}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              onFocus={() => handleError(null, 'password')}
              error={errors.password}
            />
            <HelperText type="error" visible={errors.password}>
              {errors.password}
            </HelperText>
            <TextInput
              mode="outlined"
              label="Group"
              value={inputs['group']}
              onChangeText={text => handleOnchange(text, 'group')}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              onFocus={() => handleError(null, 'group')}
              error={errors.group}
            />
            <HelperText type="error" visible={errors.group}>
              {errors.group}
            </HelperText>
            <TextInput
              mode="outlined"
              label="Shell"
              value={inputs['shell']}
              onChangeText={text => handleOnchange(text, 'shell')}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              onFocus={() => handleError(null, 'shell')}
              error={errors.shell}
            />
            <HelperText type="error" visible={errors.shell}>
              {errors.shell}
            </HelperText>
            <View style={{flexGrow: 1}}>
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
                arrowIconColor="#008570"
                searchIconColor="#008570"
                toggleIconColor="#008570"
                selectedValues={selectedKeys}
                onMultiSelect={onMultiChange2()}
                onTapClose={onMultiChange2()}
                isMulti
              />
            </View>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'row', marginVertical: 20}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 14,
                color: '#5F5F5F',
                marginStart: 10,
                includeFontPadding: false,
              }}>
              Script will be executed with root privileges. You can view the
              output from the script once run in your event log
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={validate}>
            <GradientButton text="Add User" submitting={submitting} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  closebutton: {
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
