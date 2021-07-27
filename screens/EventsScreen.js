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
} from 'react-native-paper';

import {getEvents} from '../service/events';
import AsyncStorage from '@react-native-community/async-storage';
export function EventsScreen({navigation}) {
  const [events, setEvents] = useState();
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getEvents(userToken).then(data => {
          setEvents(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
  }, []);
  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.serveranddate}>
        <Text>{item.serverSlug}</Text>
      </View>
      <View style={styles.midinfo}>
        <Text style={styles.eventname}>{item.action}</Text>
      </View>
      <View style={styles.status}>
        <Icon name="power-settings-new" size={25} color="green" />
      </View>
    </View>
  );
  const [visible, setVisible] = React.useState(false);
  const [modalData, setModalData] = React.useState();
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};

  return (
    <Provider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
          style={{
            padding: 20,
            borderRadius: 50,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{flex: 1, fontSize: 18, fontWeight: 'bold'}}>
              Event Details
            </Text>
            <Icon style={{}} name="close" size={24} onPress={hideModal} />
          </View>
          <View>
            <Text>Server: {modalData ? modalData.serverSlug : null}</Text>
            <Text>Date/Time: {}</Text>
            <Text>Message: {}</Text>
            <Text>Event: {}</Text>
          </View>
        </Modal>
      </Portal>
      <FlatList
        data={events}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={item => {
              setModalData(item);
              showModal;
            }}
            item={item}>
            <View>
              <Item item={item} />
              <Divider />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </Provider>
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
