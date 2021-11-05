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
import {getAllEvents, getEvents} from '../service/events';
import { loadMore } from '../loadMore';

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
        getAllEvents(userToken).then(data => {
            var result = data.filter(obj => {
                return obj.serverSlug === route.params.slug
              })
          setEvents(result.slice(0,20));
          setIsLoading(false);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);

    return unsubscribe;
  }, [navigation]);

  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.name}>
        <Text>{item.action}</Text>
      </View>
      <View style={styles.status}>
        {renderStatusIcon(item.status)}
      </View>
    </View>
  );

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

  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getAllEvents(userToken).then(data => {
        var result = data.filter(obj => {
            return obj.serverSlug === route.params.slug
          })
      setEvents(result);
      setIsFetching(false);
    });
    } catch (e) {
      alert(e);
    }
  };
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getEvents(userToken, route.params.slug).then(data => {
        var result = data.filter(obj => {
            return obj.serverSlug === route.params.slug
          })
      setEvents(result);
    });
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

  return (
    <View width="100%" height="100%">
      <FlatList
        data={serverEvents}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity>
            <View>
              <Item item={item} />
              <Divider />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => {
          stopFetchMore = false;
        }}
        ListFooterComponent={() => loadingMore && <ListFooterComponent />}
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
