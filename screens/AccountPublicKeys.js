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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  TextInput,
  IconButton
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {getAccountPublicKeys, postAccountPublicKeys} from '../service/accountPublicKeys';
import {deleteAccountPublicKey} from '../service/accountPublicKeys';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';


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

  const [publicKeyName, setPublicKeyName] = React.useState('');
  const [publicKey, setPublicKey] = React.useState('');

  const EmptyListMessage = ({item}) => {
    return (
      // Flat List Item
      <Text style={styles.emptyListStyle}>No Data Found</Text>
    );
  };
  const [isModalVisible,setIsModalVisible]=useState(false);
  const toggleModal=()=>{
    setIsModalVisible(!isModalVisible);
  }

  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await postAccountPublicKeys(userToken, publicKeyName, publicKey);
    if (result.status == 201) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'PublicKey created',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      setPublicKey("");
      setPublicKeyName("");
      toggleModal();
    } else if (result.status == 400) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: result.response.message,
          visibilityTime:4000,
          autoHide:true
        })
      } catch (e) {
        alert(e);
      }
    }
  };

  return (
    <>
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
        ListEmptyComponent={EmptyListMessage}
      />
      <FAB
        style={styles.fab}
        color="white"
        icon="plus"
        animated={true}
        accessibilityLabel="Create new server"
        onPress={() => toggleModal()}
      />
    </View>
    <Modal isVisible={isModalVisible} style={{margin:0}} >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
        style={{backgroundColor: 'white', paddingBottom: 20}}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal}
            />
          </View>

          <Text style={styles.titleText}>Add public key to account</Text>
          <View style={{padding: 20}}>
            <TextInput
              mode="outlined"
              label="Key name (e.g. Bob's Macbook)"
              value={publicKeyName}
              onChangeText={publicKeyName => setPublicKeyName(publicKeyName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Your public key"
              multiline
              numberOfLines={10}
              value={publicKey}
              onChangeText={publicKey => setPublicKey(publicKey)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
              style={{paddingTop: 20}}
            />
          </View>
        </View>
        <View
          style={{
            padding: 20,
            marginBottom: 20,
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <Button
            mode="contained"
            theme={{
              colors: {
                primary: '#008570',
              },
            }}
            onPress={sendRequest}>
            Add Key
          </Button>
        </View>
      </ScrollView>
    </Modal>
    </>
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
  closebutton: {
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
