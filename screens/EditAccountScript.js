import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Button, HelperText, TextInput, useTheme} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import BackIcon from '../assets/back-icon.svg';
import GradientButton from '../components/GradientButton';
import {patchAccountScripts} from '../service/accountScripts';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
export default function EditAccountScript({navigation, route}) {
  const [inputs, setInputs] = React.useState({
    id: 0,
    name: '',
    filename: '',
    content: '',
  });
  const [errors, setErrors] = React.useState({});
  useEffect(() => {
    if (route.params) {
      setInputs({
        id: route.params.id ?? 0,
        name: route.params.name ?? '',
        filename: route.params.filename ?? '',
        content: route.params.content ?? '',
      });
    }
  }, [route.params]);
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await patchAccountScripts(
      userToken,
      inputs.id,
      inputs.name,
      inputs.filename,
      inputs.content,
    );
    if (result.status == 200) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'The script has been updated',
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
        navigation.goBack();
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
  const theme = useTheme();
  return (
    <BottomSheetWrapper title="Edit script" onClose={() => navigation.goBack()}>
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.background,
          paddingHorizontal: 20,
          gap: 24,
        }}>
        <View
          style={{
            padding: 16,
            gap: 12,
            backgroundColor: theme.colors.surface,
            borderRadius: 4,
          }}>
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
              Filename
            </Text>
            <TextInput
              mode="flat"
              value={inputs['filename']}
              dense={true}
              onChangeText={text => handleOnchange(text, 'filename')}
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
              onFocus={() => handleError(null, 'filename')}
              error={errors.filename}
            />
            {errors.filename ? (
              <HelperText type="error" padding="none" visible={errors.filename}>
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
              onFocus={() => handleError(null, 'content')}
              error={errors.content}
            />
            {errors.content ? (
              <HelperText type="error" padding="none" visible={errors.content}>
                {errors.content}
              </HelperText>
            ) : null}
          </View>
          <View style={{flex: 1, justifyContent: 'flex-start'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 20,
              }}>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  width: 3,
                }}></View>
              <Text
                style={{
                  fontFamily: 'Poppins-Light',
                  fontSize: 12,
                  color: theme.colors.text,
                  marginStart: 10,
                }}>
                This will add a globally available File or Script to your
                account which you can deploy to any server.
              </Text>
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
              Update script
            </Button>
          </View>
        </View>
      </View>
    </BottomSheetWrapper>
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
