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
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Avatar, Divider} from 'react-native-paper';
export function HomeScreen({navigation}){
    const [servers, setServers] = useState([
        { hostname: 'My Awesome Server', slug:'test1' ,ipv4: '45.148.23.233', primaryalias: 'google.com', dc: 'US' , profile: 'SSD Nano' },
        { hostname: 'Load Balancer', slug:'test2' ,ipv4: '45.148.23.234', primaryalias: 'twitter.com', dc: 'EU' , profile: 'SSD Medium'  },
        { hostname: 'My Awesome Server 2',slug:'test3' , ipv4: '45.148.23.235', primaryalias: 'webdock.io', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 3',slug:'test4' , ipv4: '45.148.23.235', primaryalias: 'instagram.com', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 4',slug:'test5' , ipv4: '45.148.23.235', primaryalias: 'snapchat.com', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 5',slug:'test6' , ipv4: '45.148.23.235', primaryalias: 'android.com', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 6',slug:'test7' , ipv4: '45.148.23.235', primaryalias: 'stackoverflow.com', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 7',slug:'test8' , ipv4: '45.148.23.235', primaryalias: 'moodle.com', dc: 'EU' , profile: 'SSD Large'},
        { hostname: 'My Awesome Server 8',slug:'test9' , ipv4: '45.148.23.235', primaryalias: 'apple.com', dc: 'EU' , profile: 'SSD Large'},
      ]);
    const Item = ({ title,alias,dc,profile,ipv4 }) => (
        <View style={styles.item}>
            <View style={styles.logo}>
                <Avatar.Image 
                    source={{
                        uri: "https://logo.clearbit.com/"+alias,
                    }}
                    theme={{colors: { primary: 'transparent'}}}
                    style={styles.logoitem}
                />
            </View>
            <View style={styles.midinfo}>
              <Text style={styles.hostname}>{title}</Text>
              <Text style={styles.datacenterandprofile}>{dc==="US"?<Image source={{uri:'https://api.webdock.io/concrete/images/countries/us.png'}} />:<Image source={{uri:'https://api.webdock.io/concrete/images/countries/europeanunion.png'}} />} {profile}</Text>
              <Text style={styles.ipv4}>{ipv4}</Text>
            </View>
            <View style={styles.status}>
              <Icon name='power-settings-new' size={25} color="green" />
            </View>
        </View>
        
      );
      

    return(
        <View>
        <FlatList
            data={servers}
            renderItem={({item})=>(
              <TouchableOpacity onPress={()=>navigation.navigate('ServerManagement')}>
                <View>
                  <Item title={item.hostname} alias={item.primaryalias} 
                    dc={item.dc} profile={item.profile} ipv4={item.ipv4}/>
                  <Divider/>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.slug}
        />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: StatusBar.currentHeight || 0,
    },
    item: {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between',
      marginVertical: 5,
      marginHorizontal: 5,
      padding:5
    },
    logo:{
      width:'20%',
      alignItems:'center'
    },
    logoitem:{
      
    },
    midinfo:{
      width:'65%',
      flex: 1,
      textAlign:'left',
      marginHorizontal:'5%',
      justifyContent: 'center', //Centered vertically
      flex:1,
    },
    status:{
      width:'15%',
      alignItems:'center',
      justifyContent:'center'
    },
    hostname: {
      height:'33%',
      fontSize: 12,
      fontWeight:'bold',
      textAlignVertical: 'center',
    },
    datacenterandprofile: {
      height:'33%',
      fontSize: 12,
      fontWeight:'normal',
      textAlignVertical: 'center',
    },
    ipv4: {
      height:'33%',
      fontSize: 12,
      fontWeight:'normal',
      textAlignVertical: 'center',
    },
  });