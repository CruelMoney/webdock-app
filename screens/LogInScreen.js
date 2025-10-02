import React, {useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TextInput, Card, Button, Divider} from 'react-native-paper';
import LOGO from '../assets/logowhite.svg';
import * as Animatable from 'react-native-animatable';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {AsyncStorage} from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/context';
import {TouchableOpacity} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {getPing} from '../service/ping';

export function LogInScreen({navigation}) {
  const [token, setToken] = useState('');

  const {signIn} = React.useContext(AuthContext);

  //  handleSubmit = () => (
  //   fetch('https://api.webdock.io/v1/ping', {
  //     method: 'GET',
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization': 'Bearer '+ email,
  //     },
  //   })
  //   .then((response) => response.json())
  //   .then((json) => {
  //     console.log(JSON.stringify(json,"null",4));
  //     if(json.webdock=="rocks"){

  //     }
  //     return json.webdock;
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   })
  // );
  const loginHandle = usertoken => {
    getPing(usertoken).then(data => {
      if (data.webdock === 'rocks') {
        signIn(usertoken);
      } else {
        Alert.alert('Error', 'Something went wrong!');
      }
    });
  };
  const [data, setData] = React.useState({
    username: '',
    password: '',
    check_textInputChange: false,
    secureTextEntry: true,
    isValidUser: true,
    isValidPassword: true,
  });

  const updateSecureTextEntry = () => {
    setData({
      ...data,
      secureTextEntry: !data.secureTextEntry,
    });
  };

  const [loginWithToken, setLoginWithToken] = useState(false);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#009387" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.text_header}>Welcome back!</Text>
      </View>
      <Animatable.View
        animation="fadeInUpBig"
        style={[
          styles.footer,
          {
            backgroundColor: '#ffffff',
          },
        ]}>
        {loginWithToken == false ? (
          <>
            <Text style={[styles.text_footer]}>Username</Text>
            <View style={styles.action}>
              <TextInput
                placeholder="Your Username"
                mode="outlined"
                theme={{
                  colors: {
                    primary: '#018647',
                  },
                }}
                placeholderTextColor="#666666"
                style={[styles.textInput]}
                autoCapitalize="none"
                left={<TextInput.Icon name="account" />}
                onChangeText={val =>
                  setData({
                    ...data,
                    username: val,
                  })
                }
              />
              {data.check_textInputChange ? (
                <Animatable.View animation="bounceIn">
                  <Feather name="check-circle" color="green" size={20} />
                </Animatable.View>
              ) : null}
            </View>
            {data.isValidUser ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Username must be 4 characters long.
                </Text>
              </Animatable.View>
            )}

            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 10,
                },
              ]}>
              Password
            </Text>
            <View style={styles.action}>
              <TextInput
                placeholder="Your Password"
                mode="outlined"
                theme={{
                  colors: {
                    primary: '#018647',
                  },
                }}
                placeholderTextColor="#666666"
                style={[styles.textInput]}
                autoCapitalize="none"
                onChangeText={val =>
                  setData({
                    ...data,
                    password: val,
                  })
                }
                secureTextEntry={data.secureTextEntry ? true : false}
                right={<TextInput.Icon name="eye" />}
                left={
                  <TextInput.Icon name="lock" onPress={updateSecureTextEntry} />
                }
              />
            </View>
            {data.isValidPassword ? null : (
              <Animatable.View animation="fadeInLeft" duration={500}>
                <Text style={styles.errorMsg}>
                  Password must be 8 characters long.
                </Text>
              </Animatable.View>
            )}

            <View style={styles.button}>
              <Button mode="contained" color="#018647" style={{width: '100%'}}>
                Log In
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.text_footer,
                {
                  marginTop: 10,
                },
              ]}>
              Api Key
            </Text>
            <View style={styles.action}>
              <TextInput
                placeholder="Your Api Key"
                mode="outlined"
                theme={{
                  colors: {
                    primary: '#018647',
                  },
                }}
                placeholderTextColor="#666666"
                style={[styles.textInput]}
                autoCapitalize="none"
                onChangeText={val => setToken(val)}
                left={<TextInput.Icon name="key" />}
              />
            </View>
            <View style={styles.button}>
              <Button
                mode="contained"
                color="#018647"
                style={{width: '100%'}}
                onPress={() => {
                  loginHandle(token);
                }}>
                Log In
              </Button>
            </View>
          </>
        )}

        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
          <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
          <View>
            <Text style={{width: 50, textAlign: 'center'}}>OR</Text>
          </View>
          <View style={{flex: 1, height: 1, backgroundColor: 'grey'}} />
        </View>
        <View style={styles.button}>
          <Button
            icon="qrcode-scan"
            mode="flat"
            color="#018647"
            onPress={() => {
              navigation.navigate('ScanScreen');
            }}>
            Scan QR Code
          </Button>
          <Button onPress={() => navigation.navigate('LogInWebView')}>
            Login WebView
          </Button>
          {loginWithToken == false ? (
            <Button
              icon="key"
              mode="flat"
              color="#018647"
              onPress={() => {
                setLoginWithToken(true);
              }}>
              Login With App Token
            </Button>
          ) : (
            <Button
              icon="at"
              mode="flat"
              color="#018647"
              onPress={() => {
                setLoginWithToken(false);
              }}>
              Login With Email
            </Button>
          )}
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://app.webdock.io/en/signup')}>
          <Text style={{textAlign: 'center'}}>
            Don't have an account yet?{' '}
            <Text style={{color: '#009387', marginTop: 15}}>Sign up here!</Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
    // <View style={{ flex:1, justifyContent:'space-between'}}>
    //   <View style={styles.screen}>

    //     <View style={{height:'30%'}}>
    //     <View style={{alignItems:'flex-end', padding:10}}></View>
    //     <Image style={{alignSelf:'center'}} source={require('../assets/logowhite.png')} />
    //     </View>
    //     <View style={{height:'70%'}}>
    //     <Card  style={{
    //     margin:20,
    //     padding:10,
    //     height:'70%',
    //     marginTop:'-15%'
    //   }}>
    //   <TextInput
    //   mode="outlined"
    //   label="Token"
    //   theme={{ colors: { primary: '#008570',underlineColor:'transparent',}}}
    //   onChangeText={(token) => setToken(token)}
    //   style={styles.email}
    //   />

    //   <Button mode="contained" theme={{ colors: { primary: '#008570'}}}
    //       onPress={()=>{loginHandle(token)}}>
    //         Log In
    //   </Button>
    //   <Divider />
    //   <Button mode="contained" theme={{ colors: { primary: '#008570'}}}
    //       onPress={()=>{navigation.navigate("ScanScreen")}}>
    //         Scan
    //   </Button>
    //   </Card>
    //   </View>
    //   </View>
    // </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#008570',
    width: '100%',
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  email: {
    margin: 20,
  },
  welcomeback: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#009387',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  footer: {
    flex: 3,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  text_header: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
  },
  text_footer: {
    color: '#05375a',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 10,
    color: '#05375a',
  },
  errorMsg: {
    color: '#FF0000',
    fontSize: 14,
  },
  button: {
    alignItems: 'center',
    marginTop: 25,
  },
  signIn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
