import AsyncStorage from '@react-native-community/async-storage';
import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  Snackbar,
  ActivityIndicator,
  Colors,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {getServerScripts} from '../service/serverScripts';
import {getAllEvents, getAllEventsBySlug, getEvents, getEventsByCallbackId} from '../service/events';
import { loadMore } from '../loadMore';
import BackIcon from '../assets/back-icon.svg';
import { PureComponent } from 'react';
import ArrowIcon from '../assets/arrow-icon.svg'
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';

let stopFetchMore = true;
const ListFooterComponent = () => (
  <Text
    style={{
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 5,
    }}
  >
    Loading...
  </Text>
);

export default function ServerEvents({route, navigation}) {
  const [serverEvents, setEvents] = useState([]);
  const [eventsUpdated, setEventsUpdated] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        if(route.params.callbackId){
          getEventsByCallbackId(userToken,route.params.callbackId).then(data =>{
            setEvents(data)
            setIsLoading(false);
          })
        }else{
          getAllEventsBySlug(userToken,route.params.slug).then(data => {
            setEvents(data);
            setIsLoading(false);
          });
        }
      } catch (e) {
        alert(e);
      }
    }, 0);

    return unsubscribe;
  }, [route]);
  if(route.params.callbackId){
    useEffect(()=>{
      const interval = setInterval(async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          if(route.params.callbackId){
            getEventsByCallbackId(userToken,route.params.callbackId).then(data =>{
                setEvents(data)
                if(data.filter(obj => {
                  return obj.status === "waiting" || obj.status ==="working"
                }).length==0){
                  clearInterval(interval)
                }
            })
          }
        } catch (e) {
          alert(e);
        }
      }, 1500);
      return () => clearInterval(interval)
    },[])
  }
  class Item extends PureComponent {
    render(){
      return(
      <View style={{backgroundColor:'white',borderRadius:10}}>
        <View style={{display:'flex',padding:15,flexDirection:'row',
          alignItems:'center',justifyContent:'space-between'}}>
          <View style={{width:'90%'}}>
            <View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
              {renderStatusIcon(this.props.item.status)}
              <Text style={{marginStart:5,width:100,fontFamily:'Raleway-Regular',fontSize:12}}>{this.props.item.serverSlug}</Text>
              <Text style={{fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{this.props.item.startTime}</Text>
            </View>
            <Text style={{fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{this.props.item.action}</Text>
          </View>
          <View>
          { this.props.item.status!="waiting" && this.props.item.status!="finished" && this.props.item.status!="working"?
          <TouchableOpacity onPress={()=>{
            setEventDetailsModal(true)
            setEventDetails(this.props.item)
          }}><ArrowIcon width={15} height={15}/></TouchableOpacity>
          :null}
          </View>
        </View>
      </View>
      )
    }
  }

  const renderStatusIcon=(icon)=>{
    if(icon=="error"){
      return <Icon name="info-outline" size={14} color="red" />;
    }else if(icon=="finished"){
      return <Icon name="done" size={14} color="green" />;
    }else if(icon=="waiting"){
      return <ActivityIndicator animating={true} size={10} color={Colors.blue400}/>;
    }else if(icon=="working"){
      return <ActivityIndicator animating={true} size={10} color={Colors.blue400} />

    }
    return null;
  }

  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      if(route.params.callbackId){
        getEventsByCallbackId(userToken,route.params.callbackId).then(data =>{
          setEvents(data)
          setIsFetching(false);
        })
      }else{
        getAllEventsBySlug(userToken,route.params.slug).then(data => {
          setEvents(data);
          setIsFetching(false);
        });
      }
    } catch (e) {
      alert(e);
    }
  };
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      if(route.params.callbackId){
        getEventsByCallbackId(userToken,route.params.callbackId).then(data =>{
          setEvents(data)
        })
      }else{
        getAllEventsBySlug(userToken,route.params.slug).then(data => {
          setEvents(data);
        });
      }
    } catch (e) {
      alert(e);
    }
  };

  const loadMoreItems = async () => {
    setLoadingMore(true);
    if(!stopFetchMore){
    let userToken = null;
      try {
        
        userToken = await AsyncStorage.getItem('userToken');
        getAllEvents(userToken).then(data => {
          setEvents(data);
          setIsLoading(false);
          stopFetchMore=true;
        });
      } catch (e) {
        alert(e);
      }
      setLoadingMore(false);
    }
  };
  const [eventDetailsModal,setEventDetailsModal] = useState(false)
  const [eventDetails,setEventDetails] = useState(false)
  return (
    <SafeAreaView>
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',padding:'8%'}}>
    <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <TouchableOpacity onPress={navigation.goBack}><BackIcon height={45} width={50}/></TouchableOpacity>
      <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>{route.params.slug}</Text>
      <View style={{width:50}}></View>
    </View>
      <FlatList
        data={serverEvents}
        style={{marginTop:10}}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <>
          <TouchableOpacity>
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
        keyExtractor={item => item.id}
        // onEndReached={loadMoreItems}
        // onEndReachedThreshold={0.5}
        // onScrollBeginDrag={() => {
        //   stopFetchMore = false;
        // }}
        // ListFooterComponent={() => loadingMore && <ListFooterComponent />}
      />
    </View>
        <Modal
        testID={'modal'}
        isVisible={eventDetailsModal}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={()=>setEventDetailsModal(false)}
        style={{justifyContent: 'flex-end',margin: 0}}>
        <View style={{backgroundColor:'white',padding:30,borderTopStartRadius:10, borderTopEndRadius:10}}>
          <Text style={{fontFamily:'Raleway-Medium',fontSize:18,color:'#00a1a1',marginVertical:10}}>Error details</Text>
          <Text style={{fontFamily:'Raleway-Regular',fontSize:12}}>We are sorry but we could not complete your command. In most cases an Administrator has already been notified. In some cases you can figure out what went wrong and fix it yourself by looking at the command output below.</Text>
          <View style={{borderColor:'#AEAEAE',borderStyle:'dashed',borderWidth:1,borderRadius:4,padding:20,marginVertical:15}}>
                <Text style={{fontFamily:'Raleway-Regular',fontSize:10}}>{eventDetails.message}</Text>
              </View>
          <View style={{width:'100%',marginVertical:15,display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <TouchableOpacity style={{width:"100%"}} onPress={()=>setEventDetailsModal(false)}>
                  <LinearGradient locations={[0.29,0.80]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={['#00A1A1', '#03A84E']} style={{borderRadius:5}}>
                      <Text style={{padding:15,fontFamily:'Raleway-Bold',fontSize:18,color:'white',textAlign:'center'}}>
                        Okay, thanks
                      </Text>
                  </LinearGradient>
                </TouchableOpacity>
          </View>
        </View>
        </Modal> 
        </SafeAreaView>
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
  icon: {
    width: '10%',
  },
  name: {
    width: '80%',
  },
  status: {
    width: '10%',
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
});
