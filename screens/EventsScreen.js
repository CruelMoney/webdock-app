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
export function EventsScreen({navigation}){
    const [events, setEvents] = useState([
        { id: 0, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 1, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 2, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 3, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 4, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 5, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 6, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 7, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
        { id: 8, serverSlug:'test1' ,action: 'sample', actionData: 'sample data', message: 'sample message' , status: 'done' },
      ]);
      const Item = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.serveranddate}>
               <Text>{item.serverSlug}</Text>
            </View>
            <View style={styles.midinfo}>
              <Text style={styles.eventname}>{item.actionData}</Text>
            </View>
            <View style={styles.status}>
              <Icon name='power-settings-new' size={25} color="green" />
            </View>
        </View>
        
      );
    return(
        <View>
        <FlatList
            data={events}
            renderItem={({item})=>(
              <TouchableOpacity >
                <View>
                  <Item item={item}/>
                  <Divider/>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
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
    serveranddate:{
      width:'20%',
      alignItems:'center'
    },
    midinfo:{
      width:'65%',
      flex: 1,
      textAlign:'center',
      marginHorizontal:'5%',
      justifyContent: 'center', //Centered vertically
      flex:1,
    },
    status:{
      width:'15%',
      alignItems:'center',
      justifyContent:'center'
    },
    eventname: {
      fontSize: 12,
      textAlign: 'center',
    },
  });