import React,{useState} from 'react';
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
} from 'react-native';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import { TextInput, Card,Button } from 'react-native-paper';
import LOGO from '../assets/logowhite.svg';

import { AsyncStorage } from '@react-native-community/async-storage';
import { AuthContext } from '../components/context';

export function LogInScreen({navigation}){
  const [token, setToken] = useState("");

  const { signIn }=React.useContext(AuthContext);


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
  const loginHandle = (usertoken)=>{
    getPing(usertoken).then(data => {
      if(data.webdock==="rocks"){
          signIn(usertoken);
      }else{
          Alert.alert("Error","Something went wrong!")
      }
  })
  }

  return(
      <View style={{ flex:1, justifyContent:'space-between'}}>
        <View style={styles.screen}>
          <View style={{height:'30%'}}>
          <View style={{alignItems:'flex-end', padding:10}}><Icon name="help" color="white" size={25}/></View>
          <Image style={{alignSelf:'center'}} source={require('../assets/logowhite.png')} />
          </View>
          <View style={{height:'70%'}}>
          <Card  style={{
          margin:20,
          padding:10,
          height:'70%',
          marginTop:'-15%'
        }}>
        <TextInput
        mode="outlined"
        label="Token"
        theme={{ colors: { primary: '#008570',underlineColor:'transparent',}}}
        onChangeText={(token) => setToken(token)}
        style={styles.email}
        />

        <Button mode="contained" theme={{ colors: { primary: '#008570'}}} 
            onPress={()=>{loginHandle(token)}}>
              Log In
        </Button>
        <Button mode="contained" theme={{ colors: { primary: '#008570'}}} 
            onPress={()=>{navigation.navigate("ScanScreen")}}>
              Scan
        </Button>
        </Card>
        </View>
        </View>
      </View>
    )
}
const styles = StyleSheet.create({
  screen:{ 
    backgroundColor: '#008570', 
    width:'100%',
    height:'100%',
    flex:1,
    flexDirection:'column',
    justifyContent:'space-between'
  },
  email:{
    margin:20,
  },
  welcomeback:{
    fontWeight:'bold',
    fontSize:20,
    textAlign:'center'
  }
});