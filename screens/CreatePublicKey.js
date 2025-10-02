import React, {useState} from 'react';
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
  Linking,
  Keyboard,
  ActivityIndicator,
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
  IconButton,
  HelperText,
} from 'react-native-paper';
import BackIcon from '../assets/back-icon.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {postAccountPublicKeys} from '../service/accountPublicKeys';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import GradientButton from '../components/GradientButton';
export default function CreatePublicKey({navigation}) {
  const [inputs, setInputs] = React.useState({
    name: '',
    key: '',
  });
  const [errors, setErrors] = React.useState({});

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
        navigation.goBack();
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
          Add public key
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
              label="Key name (e.g. Bob's Macbook)"
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
              label="Your public key"
              value={inputs['key']}
              onChangeText={text => handleOnchange(text, 'key')}
              selectionColor="#00A1A1"
              dense={true}
              multiline
              numberOfLines={5}
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
              onFocus={() => handleError(null, 'key')}
              error={errors.key}
              style={{marginTop: 15}}
            />
            <HelperText type="error" visible={errors.key}>
              {errors.key}
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
              This will add a globally available SSH Public Key to your account
              which you can assign to any of your shell users.
            </Text>
          </View>
          <View style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
            <View style={{backgroundColor: '#FFEB3B', width: 1}}></View>
            <View>
              <Text
                style={{
                  fontFamily: 'Raleway-Regular',
                  fontSize: 12,
                  color: '#5F5F5F',
                  marginStart: 10,
                }}>
                Please omit any comments and begin / end markers in your Public
                key. Just paste the key itself.{' '}
              </Text>
              <Pressable
                onPress={() =>
                  handleClick(
                    'https://app.webdock.io/en/docs/webdock-control-panel/shell-users-and-sudo/set-up-an-ssh-key',
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
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <TouchableOpacity onPress={validate}>
            <GradientButton text="Add public key" submitting={submitting} />
            {/* <LinearGradient
              locations={[0.29, 0.8]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['#00A1A1', '#03A84E']}
              style={{
                borderRadius: 5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {!submitting ? (
                <Text
                  style={{
                    padding: 15,
                    fontFamily: 'Raleway-Bold',
                    fontSize: 18,
                    color: 'white',
                    textAlign: 'center',
                    includeFontPadding: false,
                  }}>
                  Add public key
                </Text>
              ) : (
                <ActivityIndicator size="large" color="#ffffff" />
              )}
            </LinearGradient> */}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
