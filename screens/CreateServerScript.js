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
import {postAccountPublicKeys} from '../service/accountPublicKeys';
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

export default function CreateServerScript({route, navigation}) {
  const [inputs, setInputs] = React.useState({
    selectedScript: '',
    path: '',
  });
  const [modifiedScripts, setModifiedScripts] = useState([]);
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerScripts(userToken, route.params.slug).then(data => {
          //setScripts(data);
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
  const [checkedExecutable, setCheckedExecutable] = React.useState(false);
  const [checkedRunThisNow, setCheckedRunThisNow] = React.useState(false);

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
          Add new script
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
            <View
              style={{
                height: 40,
                borderColor: '#00A1A1',
                color: '#00A1A1',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <Picker
                selectedValue={inputs['selectedScript']}
                style={{
                  width: '100%',
                  color: '#00A1A1',
                  includeFontPadding: false,
                }}
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
            <HelperText type="error" visible={errors.selectedScript}>
              {errors.selectedScript}
            </HelperText>
            <TextInput
              mode="outlined"
              label="Absolute path and filename on server"
              value={inputs['path']}
              onChangeText={text => handleOnchange(text, 'path')}
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
              onFocus={() => handleError(null, 'path')}
              error={errors.filename}
            />
            <HelperText type="error" visible={errors.path}>
              {errors.path}
            </HelperText>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedExecutable ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedExecutable(!checkedExecutable);
                }}
                color="#00A1A1"
              />
              <Text style={{fontFamily: 'Raleway-Normal'}}>
                Make file executable
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedRunThisNow ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedRunThisNow(!checkedRunThisNow);
                }}
                color="#00A1A1"
              />
              <Text style={{fontFamily: 'Raleway-Normal'}}>Run this now</Text>
            </View>
          </View>
          <View style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
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
          <View style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
            <View style={{backgroundColor: '#03A84E', width: 1}}></View>
            <Text
              style={{
                fontFamily: 'Raleway-Regular',
                fontSize: 12,
                color: '#5F5F5F',
                marginStart: 10,
              }}>
              If you want to add or edit scripts, do so in your main Account
              area
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={validate}>
            <GradientButton text="Deploy this script" submitting={submitting} />
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
