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
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {getAccountPublicKeys} from '../service/accountPublicKeys';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';

export default function AccountPublicKeys({navigation}) {
  const [publicKeys, setPublicKeys] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAccountPublicKeys(userToken).then(data => {
          setPublicKeys(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [navigation]);

  const deletePublicKeyAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Delete Public Keys',
      'Do you really want to delete this Public Key?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            deleteAccountPublicKey(userToken, pkey);
            onBackgroundRefresh();
            console.log(publicKeys);
          },
        },
      ],
    );
  };
  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.name}>
        <Text>{item.name}</Text>
      </View>
      <View style={styles.status}>
        <Icon
          name="clear"
          size={25}
          color="green"
          onPress={() => {
            deletePublicKeyAlert(item.id);
          }}
        />
      </View>
    </View>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getAccountPublicKeys(userToken).then(data => {
        setPublicKeys(data);
        setIsFetching(false);
      });
      console.log(publicKeys);
    } catch (e) {
      alert(e);
    }
  };
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getAccountPublicKeys(userToken).then(data => {
        setPublicKeys(data);
      });
      console.log(publicKeys);
    } catch (e) {
      alert(e);
    }
  };

  return (
    <View width="100%" height="100%">
      <FlatList
        data={publicKeys}
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
      />
      <FAB
        style={styles.fab}
        color="white"
        icon="plus"
        animated={true}
        accessibilityLabel="Create new server"
        onPress={() => navigation.navigate('CreatePublicKey')}
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
});
