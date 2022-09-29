import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  Avatar,
  Divider,
  Modal,
  Portal,
  Text,
  Button,
  Provider,
  ProgressBar,
  Colors,
  ActivityIndicator,
} from 'react-native-paper';

import {getEvents} from '../service/events';
import AsyncStorage from '@react-native-community/async-storage';
import MenuIcon from '../assets/menu-icon.svg';
import { PureComponent } from 'react';

let stopFetchMore = true;

export function EventsScreen({navigation}) {
  const [events, setEvents] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken,1).then(data => {
          setPage(page+1)
          setEvents(data);
          setIsLoading(false);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
  }, []);
  const renderStatusIcon=(icon)=>{
    if(icon=="error"){
      return <Icon name="info-outline" size={25} color="red" />;
    }else if(icon=="finished"){
      return <Icon name="done" size={25} color="green" />;
    }else if(icon=="waiting"){
      return <ActivityIndicator animating={true} size={20} color={Colors.blue400}/>;
    }else if(icon=="working"){
      return <ActivityIndicator animating={true} size={20} color={Colors.blue400} />

    }
    return null;
  }
  class Item extends PureComponent {
    render(){
      return(
      <View style={{backgroundColor:'white',borderRadius:10}}>
        <View style={{display:'flex',padding:15,flexDirection:'row',
          alignItems:'center',justifyContent:'space-between'}}>
          <View>
            <View style={{display:'flex',flexDirection:'row'}}>
              <Text style={{width:100,fontFamily:'Raleway-Regular',fontSize:12}}>{this.props.item.serverSlug}</Text>
              <Text style={{fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{this.props.item.startTime}</Text>
            </View>
            <Text style={{fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{this.props.item.action}</Text>
          </View>
          {renderStatusIcon(this.props.item.status)}
        </View>
      </View>
      )
    }
  }
  const [page,setPage]=useState(1)
  const loadMoreItems = async () => {
    setLoadingMore(true);
    if(!stopFetchMore){
    let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken,page).then(data => {
          setPage(page+1)
          setEvents(events.concat(data));
          console.log(events.length)
          setIsLoading(false);
          stopFetchMore=true;
        });
      } catch (e) {
        alert(e);
      }
      setLoadingMore(false);
    }
  };

  const renderLoader = () => {
    return (
      loadingMore ?
        <View style={styles.loaderStyle}>
          <ActivityIndicator size="medium" color="#00a1a1" />
        </View> : null
    );
  };

  return (
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',paddingTop:'8%',paddingHorizontal:'8%'}}>
      <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={navigation.openDrawer}><MenuIcon height={45} width={28}/></TouchableOpacity>
        <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>Events</Text>
        <View style={{width:50}}></View>
      </View>
      <FlatList
        data={events}
        style={{marginTop:30}}
        initialNumToRender={10}
        renderItem={({item}) => (
          <>
          <TouchableOpacity item={item}>
            <View>
              <Item item={item} />
            </View>
          </TouchableOpacity>
          <View
          style={{
              height:10,
              width: "100%",
          }} />
          </>
        )}
        keyExtractor={(item) => item.id}
        ListFooterComponent={renderLoader}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => {
          stopFetchMore = false;
        }}
        // ListFooterComponent={() => loadingMore && <ListFooterComponent />}
      />
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
  serveranddate: {
    width: '20%',
    alignItems: 'center',
  },
  loaderStyle: {
    marginVertical: 16,
    alignItems: "center",
  },
  midinfo: {
    width: '65%',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: '5%',
    justifyContent: 'center', //Centered vertically
    flex: 1,
  },
  status: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventname: {
    fontSize: 12,
    textAlign: 'center',
  },
});
