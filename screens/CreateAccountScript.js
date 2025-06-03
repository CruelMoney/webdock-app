import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {HelperText, TextInput} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import BackIcon from '../assets/back-icon.svg';
import GradientButton from '../components/GradientButton';
import {postAccountScripts} from '../service/accountScripts';
export default function CreateAccountScript({navigation}) {
  const [inputs, setInputs] = React.useState({
    name: '',
    filename: '',
    content: '',
  });
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {});

    return unsubscribe;
  }, [navigation]);
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
      handleError('Script name is required', 'name');
      isValid = false;
    }

    if (!inputs.filename) {
      handleError('Script filename is required', 'filename');
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
          Add script
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
              label="Descriptive name"
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
            <TextInput
              mode="outlined"
              label="Filename"
              value={inputs['filename']}
              onChangeText={text => handleOnchange(text, 'filename')}
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
              onFocus={() => handleError(null, 'filename')}
              error={errors.filename}
            />
            <HelperText type="error" visible={errors.filename}>
              {errors.filename}
            </HelperText>
            <TextInput
              mode="outlined"
              label="File contents"
              multiline
              numberOfLines={10}
              value={inputs['content']}
              onChangeText={text => handleOnchange(text, 'content')}
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
              onFocus={() => handleError(null, 'content')}
              error={errors.content}
            />
            <HelperText type="error" visible={errors.content}>
              {errors.content}
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
              This will add a globally available File or Script to your account
              which you can deploy to any server.
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={validate}>
            <GradientButton text="Add script" submitting={submitting} />
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
});
