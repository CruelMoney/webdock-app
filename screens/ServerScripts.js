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
import RNPickerSelect from 'react-native-picker-select';

import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  FAB,
  Provider,
  Snackbar,
  IconButton,
  Checkbox,
  TextInput,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';
import {createServerScript, deleteServerScript, executeServerScript, getServerScripts} from '../service/serverScripts';
import { getAccountScripts } from '../service/accountScripts';
export default function ServerScripts({route, navigation}) {
  const [serverScripts, setScripts] = useState();
  const [modifiedScripts,setModifiedScripts]=useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerScripts(userToken, route.params.slug).then(data => {
          setScripts(data);
        });
        getAccountScripts(userToken).then(data => {
          var array = [];
          data.map(item => {
            array.push({label: item.name, value: item.id, key: item.id});
          });
          setModifiedScripts(array);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [route]);

  const deleteScriptAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Delete Server Script',
      'Do you really want to delete this script?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            var result = await deleteServerScript(userToken,route.params.slug, pkey);
            if (result == 202) {
              onBackgroundRefresh();
              try {
                toggleModal();
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Server script deleted successfully',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
            } else if (result == 404) {
              try {
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Script not found',
                  visibilityTime: 4000,
                  autoHide: true,
                });
                toggleModal();
              } catch (e) {
                alert(e);
              }
            }
          },
        },
      ],
    );
  };
  const Item = ({item}) => (
    <View style={styles.item}>
      <View style={styles.icon}>
        <Icon
          name="perm-data-setting"
          size={25}
          color="green"
          onPress={() => {
            deleteScriptAlert(item.id);
          }}
        />
      </View>
      <View style={styles.name}>
        <Text>{item.name}</Text>
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
      getServerScripts(userToken, route.params.slug).then(data => {
        setScripts(data);
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
      getServerScripts(userToken, route.params.slug).then(data => {
        setScripts(data);
      });
    } catch (e) {
      alert(e);
    }
  };

  const [isModalVisible, setModalVisible]=useState();
  const toggleModal=()=>{
      setModalVisible(!isModalVisible);
  }
  const [modalData,setModalData]=useState();
  const modalOpen = (item) => {
      toggleModal();
      setModalData(item);
  }

  const runScript = async (scriptId) =>{
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await executeServerScript(userToken,
      route.params.slug,
      scriptId
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server script execution initiated',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
    } else if (result.status == 404) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Script not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
    } 
  }
  const [isModalVisible2, setModalVisible2]=useState();
  const toggleModal2=()=>{
      setModalVisible2(!isModalVisible2);
  }
  const [selectedScript, setSelectedScript] = React.useState('');
  const [filepath, setFilepath] = React.useState('');
  const [checkedExecutable, setCheckedExecutable] = React.useState(false);
  const [checkedRunThisNow, setCheckedRunThisNow] = React.useState(false);

  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createServerScript(
      userToken,
      route.params.slug,
      selectedScript,
      filepath,
      checkedExecutable,
      checkedRunThisNow,
    );
    if (result.status == 202) {
      try {
        toggleModal2();
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server script deployment initiated',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
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
        toggleModal2();
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server or script not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
    }
  };

  return (
    <>
    <View width="100%" height="100%">
      <FlatList
        data={serverScripts}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              modalOpen(item)
            }>
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
        onPress={() =>
          toggleModal2()
        }
      />
    </View>
    <Modal isVisible={isModalVisible}>
    <View style={styles.content}>
        <View style={{width:'100%'}}>
        <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
              <Text style={{textAlign:'center',paddingStart:20,fontSize:18}}>{modalData?modalData.name:''}</Text>

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
        </View>
        <View style={{padding: 20}}>
            <Text><Text style={{fontWeight:'bold'}}>Name: </Text>{modalData?modalData.name:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Path: </Text>{modalData?modalData.path:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Created: </Text>{modalData?modalData.created:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Last run: </Text>{modalData?modalData.lastRun:''}</Text>
          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
          }}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
            
            <Button
              mode="contained"
              icon="delete"
              theme={{
                colors: {
                  primary: '#F44336',
                },
              }}
              onPress={()=>{deleteScriptAlert(modalData.id)}}
              >
              Delete
            </Button>
            <Button
              mode="contained"
              icon="play"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>{runScript(modalData.id)}}
              >
              RUN
            </Button>
          </View>
          </View>
    </View>
    </Modal>
    <Modal isVisible={isModalVisible2}>
    <View style={styles.content}>
        <View style={{width:'100%'}}>
        <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
              <Text style={{textAlign:'center',paddingStart:20,fontSize:18}}>{'Create new server script'}</Text>

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
        </View>
        <View style={{padding: 20}}>
            {modifiedScripts ? (
              <RNPickerSelect
                style={{
                  inputIOS: {
                    color: 'black',
                    paddingTop: 13,
                    paddingHorizontal: 10,
                    paddingBottom: 12,
                  },
                  inputAndroid: {
                    color: 'black',
                  },
                  placeholderColor: 'black',
                }}
                onValueChange={value => setSelectedScript(value)}
                items={modifiedScripts}
              />
            ) : (
              <View>
                <Text>Loading</Text>
              </View>
            )}

            <TextInput
              mode="outlined"
              label="Absolute path and filename on server"
              value={filepath}
              onChangeText={filepath => setFilepath(filepath)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
          </View>
          <View style={{paddingLeft: 20}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedExecutable ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedExecutable(!checkedExecutable);
                }}
              />
              <Text>Make file executable</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedRunThisNow ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedRunThisNow(!checkedRunThisNow);
                }}
              />
              <Text>Run this now</Text>
            </View>
          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
          }}>
          <View style={{flexDirection:'row',justifyContent:'flex-end'}}>
            <Button
              mode="contained"
              icon="play"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={sendRequest}
              >
              Deploy this Script
            </Button>
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
  closebutton: {
    alignItems: 'flex-end',
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
  content1: {
    width:'100%',
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign:'center'
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
