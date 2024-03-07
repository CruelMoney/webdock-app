import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {
  IconButton,
  Button,
  Divider,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import {postAccountPublicKeys} from '../service/accountPublicKeys';
import {postAccountScripts} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import {TouchableOpacity} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
import {Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ActivityIndicator} from 'react-native';
import {Keyboard} from 'react-native';
import GradientButton from '../components/GradientButton';
import {createSnapshotForServer} from '../service/serverActions';
export default function CreateServerSnapshot({route, navigation}) {
  const [inputs, setInputs] = React.useState({
    name: '',
  });
  const [callbackId, setCallbackId] = useState();
  const [visibleSnack, setVisibleSnack] = React.useState(false);

  const onToggleSnackBar = () => setVisibleSnack(!visibleSnack);

  const onDismissSnackBar = () => setVisibleSnack(false);
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {});

    return unsubscribe;
  }, [navigation]);
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
          Create new snapshot
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
              label="Snapshot name"
              value={inputs['name']}
              onChangeText={text => handleOnchange(text, 'name')}
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
              onFocus={() => handleError(null, 'name')}
              error={errors.name}
            />
            <HelperText type="error" visible={errors.name}>
              {errors.name}
            </HelperText>
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
              Webdock Snapshots are easy to use, reliable and redundant on- and
              off-site backups for your Webdock server. Webdock performs backups
              without causing any interruption of your running system. We
              provide 8 backup slots in total.
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={validate}>
            <GradientButton text="Create Snapshot" submitting={submitting} />
            {/* <LinearGradient locations={[0.29,0.80]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={['#00A1A1', '#03A84E']} style={{borderRadius:5}}>
            {!submitting?
              <Text style={{padding:15,fontFamily:'Raleway-Bold',fontSize:18,color:'white',textAlign:'center'}}>
                Add script
              </Text>:
              <ActivityIndicator size="large" color="#ffffff" style={{padding:10}} />
            }
          </LinearGradient> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
