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
  Snackbar,
  IconButton,
  TextInput,
} from 'react-native-paper';
import Modal from "react-native-modal";

import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { deleteServerSnapshot, getServerSnapshots } from '../service/serverSnapshots';
import { createSnapshotForServer, restoreFromSnapshot } from '../service/serverActions';
export default function ServerSnapshots({route, navigation}) {
  const [serverSnapshots, setSnapshots] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerSnapshots(userToken, route.params.slug).then(data => {
          setSnapshots(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [route]);

  const deleteSnapshotsAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Delete Snapshot',
      'Do you really want to delete this snapshot?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            var result = await deleteServerSnapshot(userToken,route.params.slug, pkey);
            if (result == 202) {
              onBackgroundRefresh();
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Account script deleted successfully',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
              toggleModal();
            } else if (result == 404) {
              try {
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Script not found',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
            }
          },
        },
      ],
    );
  };

  const createSnapshot = async (name) => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createSnapshotForServer(
        userToken,
        route.params.slug,
        name
      );
      if (result.status == 202) {
        try {
          Toast.show({
            type: 'success',
            position: 'bottom',
            text1: 'Snapshot initiated',
            visibilityTime: 4000,
            autoHide: true
          });
        } catch (e) {
          alert(e);
        }
        toggleModal2();
      } else if (result.status == 400) {
        try {
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: result.response.message,
            visibilityTime: 4000,
            autoHide: true
          });
        } catch (e) {
          alert(e);
        }
      } else if (result.status == 404) {
        try {
          Toast.show({
            type: 'error',
            position: 'bottom',
            text1: 'Server or snapshot not found!',
            visibilityTime: 4000,
            autoHide: true
          });
        } catch (e) {
          alert(e);
        }
      }
  };

  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.name}>
      <Text>{item.name}<Text> - {item.type}</Text></Text>
      
      </View>
      <View style={styles.status}></View>
    </View>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerSnapshots(userToken, route.params.slug).then(data => {
        setSnapshots(data);
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
      getServerSnapshots(userToken, route.params.slug).then(data => {
        setSnapshots(data);
      });
    } catch (e) {
      alert(e);
    }
  };
  
  const [isModalVisible, setModalVisible]=useState();
  const toggleModal=()=>{
      setModalVisible(!isModalVisible);
  }
  const [isModalVisible2, setModalVisible2]=useState();
  const toggleModal2=()=>{
      setModalVisible2(!isModalVisible2);
  }
  const restoreThisSnapshot =async (snapshotId) => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await restoreFromSnapshot(
      userToken,
      route.params.slug,
      snapshotId
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Snapshot restore initiated',
          visibilityTime: 4000,
          autoHide: true
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
    } else if (result.status == 400) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: result.response.message,
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 404) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server or snapshot not found!',
          visibilityTime: 4000,
          autoHide: true
        });
      } catch (e) {
        alert(e);
      }
    }
  };

  const [modalData,setModalData]=useState();
  const modalOpen = (item) => {
      toggleModal();
      setModalData(item);
  }
  const [newSnapshotName,setNewSnapshotName]=useState();

  return (
      <>
    <View width="100%" height="100%">
      <FlatList
        data={serverSnapshots}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={()=>modalOpen(item)}>
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
        accessibilityLabel="Create new script"
        onPress={()=>toggleModal2()}
      />
      
    </View>
    <Modal isVisible={isModalVisible}>
    
    <View style={styles.content}>
        <View style={{width:'100%'}}>
        <View style={{flexDirection: 'row-reverse'}}>
          <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal}
            />
            </View>
          </View>
        </View>
        <View style={{padding: 20}}>
            <Text><Text style={{fontWeight:'bold'}}>Type: </Text>{modalData?modalData.type:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Date/Time: </Text>{modalData?modalData.date:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Name: </Text>{modalData?modalData.name:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Size: </Text>{modalData?modalData.size:''}</Text>
          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
          }}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            <Button
              mode="contained"
              icon="replay"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>restoreThisSnapshot(modalData.id)}
              >
              Restore
            </Button>
            <Button
              mode="contained"
              disabled={!(modalData?modalData.deletable:false)}
              icon="delete"
              theme={{
                colors: {
                  primary: '#F44336',
                },
              }}
              onPress={()=>deleteSnapshotsAlert(modalData.id)}
              >
              Delete
            </Button>
          </View>
          </View>
    </View>
    
    </Modal>
    <Modal isVisible={isModalVisible2}>
    
    <View style={styles.content}>
      <View style={{width:'100%'}}>
          <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
              <Text style={{textAlign:'center',paddingStart:20,fontSize:18}}>Create new snapshot</Text>

        <View style={{flexDirection: 'row-reverse'}}>
          <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal2}
            />
            </View>
          </View>
          </View>

          <View style={{padding:20}}>
          <TextInput
              mode="outlined"
              label="Snapshot name"
              value={newSnapshotName}
              onChangeText={newSnapshotName => setNewSnapshotName(newSnapshotName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
          }}>
          <View style={{flexDirection:'row-reverse',justifyContent:'space-between'}}>
            <Button
              mode="contained"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>createSnapshot(newSnapshotName)}
              >
              CREATE
            </Button>
          </View>
          </View>
        </View>
      </View>    
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
  content: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
});
