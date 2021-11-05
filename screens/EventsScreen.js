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
        getEvents(userToken,20).then(data => {
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
  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.serveranddate}>
        <Text>{item.serverSlug}</Text>
      </View>
      <View style={styles.midinfo}>
        <Text style={styles.eventname}>{item.action}</Text>
      </View>
      <View style={styles.status}>
      {renderStatusIcon(item.status)}
      </View>
    </View>
  );

  const loadMoreItems = async () => {
    setLoadingMore(true);
    if(!stopFetchMore){
    let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken,events.length+20).then(data => {
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

  return (
      <FlatList
        data={events}
        renderItem={({item}) => (
          <TouchableOpacity item={item}>
            <View>
              <Item item={item} />
              <Divider />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => {
          stopFetchMore = false;
        }}
        ListFooterComponent={() => loadingMore && <ListFooterComponent />}
      />
    
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
