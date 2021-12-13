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
  IconButton,
  TextInput,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {
  deleteAccountScript,
  getAccountScripts,
  patchAccountScripts,
  postAccountScripts,
} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';

export default function AccountScripts({navigation}) {
  const [scripts, setScripts] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAccountScripts(userToken).then(data => {
          setScripts(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [navigation]);

  const deleteScriptAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert('Delete Script', 'Do you really want to delete this script?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          var result = await deleteAccountScript(userToken, pkey);
          if (result == 200) {
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
            toggleModal();
          }
        },
      },
    ]);
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
    </View>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getAccountScripts(userToken).then(data => {
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
      getAccountScripts(userToken).then(data => {
        setScripts(data);
      });
    } catch (e) {
      alert(e);
    }
  };
  const [isModalVisible, setModalVisible]=useState();
  const [modalData, setModalData]=useState();
  const toggleModal=(data)=>{
    setModalData(data);
      setModalVisible(!isModalVisible);
  }


  const [isModalVisible2, setModalVisible2]=useState();
  const toggleModal2=()=>{
      if(!isModalVisible2){
        setScriptName(modalData.name);
        setScriptFileName(modalData.filename);
        setScriptFileContent(modalData.content);
      }
      setModalVisible2(!isModalVisible2);
  }

  const [scriptName, setScriptName] = React.useState();
  const [scriptFileName, setScriptFileName] = React.useState();
  const [scriptFileContent, setScriptFileContent] = React.useState();

  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await patchAccountScripts(
      userToken,
      modalData.id,
      scriptName,
      scriptFileName,
      scriptFileContent,
    );
    if (result.status == 200) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Updated account script',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal2();
      toggleModal();
      onBackgroundRefresh();
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
      toggleModal2();
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
    }
  }

  const [newScriptName,setNewScriptName]=useState();
  const [newScriptFileName,setNewScriptFileName]=useState();
  const [newScriptFileContent,setNewScriptFileContent]=useState();

  const [isModalVisible3, setModalVisible3]=useState();
  const toggleModal3=()=>{
      if(!isModalVisible3){
        setNewScriptName("");
        setNewScriptFileName("");
        setNewScriptFileContent("");
      }
      setModalVisible3(!isModalVisible3);
  }

  const sendCreateScriptRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await postAccountScripts(
      userToken,
      newScriptName,
      newScriptFileName,
      newScriptFileContent,
    );
    if (result.status == 201) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'The newly created account script',
          visibilityTime: 4000,
          autoHide: true
        });
      } catch (e) {
        alert(e);
      }
      toggleModal3();
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
    }
  };

  return (
    <>
    <View width="100%" height="100%">
      <FlatList
        data={scripts}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              toggleModal(item)
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
        onPress={toggleModal3}
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
            <Text><Text style={{fontWeight:'bold'}}>Description: </Text>{modalData?modalData.description:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Filename: </Text>{modalData?modalData.filename:''}</Text>
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
              onPress={()=>deleteScriptAlert(modalData.id)}
              >
              Delete
            </Button>
            <Button
              mode="contained"
              icon="pencil"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>toggleModal2()}
              >
              EDIT
            </Button>
          </View>
          </View>
    </View>
    </Modal>
    <Modal isVisible={isModalVisible2} style={{margin:0}}>
    <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
        style={{backgroundColor: 'white', paddingBottom: 20}}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
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


          <Text style={styles.titleText}>Editing {modalData?modalData.name:null}</Text>
          <View style={{padding: 20}}>
            <TextInput
              mode="outlined"
              label="Descriptive Name"
              value={scriptName}
              onChangeText={scriptName => setScriptName(scriptName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Filename"
              value={scriptFileName}
              onChangeText={scriptFileName => setScriptFileName(scriptFileName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="File contents"
              multiline
              numberOfLines={10}
              value={scriptFileContent}
              onChangeText={scriptFileContent =>
                setScriptFileContent(scriptFileContent)
              }
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
            width: Dimensions.get('window').width,
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
            Save Script
          </Button>
        </View>
      </ScrollView>
      <Toast ref={ref => Toast.setRef(ref)}/>
    </Modal>
    <Modal isVisible={isModalVisible3} style={{margin:0}} animationIn="slideInLeft" animationOutTiming={1}>
    <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
        style={{backgroundColor: 'white', paddingBottom: 20}}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <View style={{flexDirection:'row-reverse'}}>
          <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal3}
            />
          </View>
          </View>

          <Text style={styles.titleText}>Add Script to account</Text>
          <View style={{padding: 20}}>
            <TextInput
              mode="outlined"
              label="Descriptive Name"
              value={newScriptName}
              onChangeText={newScriptName => setNewScriptName(newScriptName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Filename"
              value={newScriptFileName}
              onChangeText={newScriptFileName => setNewScriptFileName(newScriptFileName)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="File contents"
              multiline
              numberOfLines={10}
              value={newScriptFileContent}
              onChangeText={newScriptFileContent =>
                setNewScriptFileContent(newScriptFileContent)
              }
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
            width: Dimensions.get('window').width,

            marginBottom: 20,
            flex: 1,
            justifyContent: 'flex-end',
          }}>
          <Text style={{marginBottom: 20}}>
            This will add a globally available File or Script to your account
            which you can deploy to any server.
          </Text>
          <Button
            mode="contained"
            theme={{
              colors: {
                primary: '#008570',
              },
            }}
            onPress={sendCreateScriptRequest}>
            Save Script
          </Button>
        </View>
      </ScrollView>
      <Toast ref={ref => Toast.setRef(ref)}/>
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
    width: '90%',
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
