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
  IconButton,
  TextInput,
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { createShellUser, deleteServerShellUsers, getServerShellUsers, updateShellUserPublicKeys } from '../service/serverShellUsers';
import { deleteServerSnapshot } from '../service/serverSnapshots';
import SelectBox from 'react-native-multi-selectbox';
import Modal from "react-native-modal";
import { xorBy } from 'lodash';
import { getAccountPublicKeys } from '../service/accountPublicKeys';
import DeleteIcon from '../assets/delete-icon.svg'
import EditIcon from '../assets/edit-icon.svg'
import BackIcon from '../assets/back-icon.svg'
import PlusIcon from '../assets/plus-icon.svg'
import PlayIcon from '../assets/play-icon.svg'
export default function ServerShellUsers({route, navigation}) {
  const [K_OPTIONS,setkoptions] = useState();
  const [shellUsers, setShellUsers] = useState();
  const [publicKeys,setPublicKeys] = useState();
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServerShellUsers(userToken, route.params.slug).then(data => {
          setShellUsers(data);          
        });
        getAccountPublicKeys(userToken).then(data=>{
          setPublicKeys(data);
          setkoptions(data.map((item) => {
            return {
                  id: item.id,
                  item: item.name}}));
        })
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [route]);

  const updateShellUserPKs=async (pkey,selected)=>{
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    var publicKeysId=selected.map((item)=>{return item.id});
    
    var result = await updateShellUserPublicKeys(userToken,route.params.slug, pkey, publicKeysId);
            if (result.status == 202) {
              onBackgroundRefresh();
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Shell user deletion initiated!',
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
                  text1: 'Server or shell user not found',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
            }
  }
  const deleteShellUserAlert = async pkey => {
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');

    Alert.alert(
      'Delete Shell User',
      'Do you really want to delete this shell user?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            var result = await deleteServerShellUsers(userToken,route.params.slug, pkey);
            if (result == 202) {
              onBackgroundRefresh();
              toggleModal();
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Shell user deletion initiated!',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
            } else if (result == 404) {
              toggleModal();

              try {
                Toast.show({
                  type: 'error',
                  position: 'bottom',
                  text1: 'Server or shell user not found',
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
  const Item = ({item}) => (
    <>
      <View style={{backgroundColor:'white',borderRadius:10,marginBottom:10}}>
        <View style={{display:'flex',padding:15,flexDirection:'row',
        alignItems:'center',justifyContent:'space-between'}}>
          <View>
            <Text style={{fontFamily:'Raleway-Regular',fontSize:12}}>{item.username}</Text>
            <View style={{display:'flex',flexDirection:'row'}}>
              <Text style={{width:100,fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{item.created}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={()=>{setIsDeleteModalVisible(true) 
            setSelectedShellUser(item)}}><DeleteIcon /></TouchableOpacity>
        </View>
      </View>
    </>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServerShellUsers(userToken, route.params.slug).then(data => {
        
      setShellUsers(data);
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
      getServerShellUsers(userToken, route.params.slug).then(data => {
        setShellUsers(data);
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
      setSelectedTeams((item.publicKeys).map((item) => {
        return {
              id: item.id,
              item: item.name}}));
  }
  const [isModalVisible2, setModalVisible2]=useState();
  const toggleModal2=()=>{
      setModalVisible2(!isModalVisible2);
  }
  const modalOpen2 = (item) => {
      toggleModal();
      setSelectedTeams((item.publicKeys).map((item) => {
        return {
              id: item.id,
              item: item.name}}));
  }
  const [newUsername, setNewUsername]=useState();
  const [newPassword, setNewPassword]=useState();
  const [newGroup, setNewGroup]=useState("sudo");
  const [newShell, setNewShell]=useState("/bin/bash");

  const createShellUseModal=async (a,b,c,d,e)=>{
    let userToken = null;

    userToken = await AsyncStorage.getItem('userToken');
    var publicKeysId=e.map((item)=>{return item.id});
    
    var result = await createShellUser(userToken,route.params.slug, a,b,c,d, publicKeysId);
            if (result.status == 202) {
              onBackgroundRefresh();
              try {
                Toast.show({
                  type: 'success',
                  position: 'bottom',
                  text1: 'Shell user creation initiated!',
                  visibilityTime: 4000,
                  autoHide: true,
                });
                toggleModal2();
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
                  text1: 'Server or shell user not found',
                  visibilityTime: 4000,
                  autoHide: true,
                });
              } catch (e) {
                alert(e);
              }
            }
  }

  const [isDeleteModalVisible,setIsDeleteModalVisible]=React.useState(false)
  const [selectedShellUser,setSelectedShellUser]=React.useState("");
  return (
    <>
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',padding:'8%'}}>
      <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={navigation.goBack}><BackIcon height={45} width={50}/></TouchableOpacity>
        <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>{route.params.slug}</Text>
        <View style={{width:50}}></View>
      </View>
      <FlatList
        data={shellUsers}
        style={{marginTop:20}}
        showsVerticalScrollIndicator={false}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        ListFooterComponent={<View style={{height:60}}></View>}
        renderItem={({item}) => (
          <TouchableOpacity onPress={()=>modalOpen(item)}>
            <View>
              <Item item={item} />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity onPress={()=>toggleModal2()} style={{position: 'absolute',right: 30,
    bottom: 30}}><PlusIcon height={50} width={50}/></TouchableOpacity>
    </View>
    <Modal isVisible={isModalVisible}>
    
    <View style={styles.content}>
        <View style={{width:'100%'}}>
        <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-between'}}>
              <Text style={{textAlign:'center',paddingStart:20,fontSize:18}}>{modalData?modalData.username:''}</Text>

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
            <Text><Text style={{fontWeight:'bold'}}>Username: </Text>{modalData?modalData.username:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Created: </Text>{modalData?modalData.created:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Group: </Text>{modalData?modalData.group:''}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Shell: </Text>{modalData?modalData.shell:''}</Text>

            <SelectBox
        label="Select public keys you want to assign to this user"
        options={K_OPTIONS}
        multiOptionContainerStyle={{
          backgroundColor:'#008570'
        }}
        arrowIconColor="#008570"
        searchIconColor="#008570"
        toggleIconColor="#008570"
        selectedValues={selectedTeams}
        onMultiSelect={onMultiChange()}
        onTapClose={onMultiChange()}
        isMulti />
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
              onPress={()=>deleteShellUserAlert(modalData.id)}
              >
              Delete
            </Button>
            <Button
              mode="contained"
              icon="update"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>updateShellUserPKs(modalData.id, selectedTeams)}
              >
              Assign Keys
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
    <View style={styles.content1} >
        <View style={{width:'100%'}}>
        <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={toggleModal2}
            />
          </View>

          <Text style={styles.contentTitle}>Create new Shell User</Text>
        </View>
        <View style={{padding: 20}}>
          <TextInput
              mode="outlined"
              label="Username"
              style={{marginBottom:10}}
              value={newUsername}
              onChangeText={newUsername => setNewUsername(newUsername)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Password"
              style={{marginBottom:10}}
              value={newPassword}
              onChangeText={newPassword => setNewPassword(newPassword)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Group"
              style={{marginBottom:10}}
              value={newGroup}
              onChangeText={newGroup => setNewGroup(newGroup)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
            <TextInput
              mode="outlined"
              label="Shell"
              style={{marginBottom:10}}
              value={newShell}
              onChangeText={newShell => setNewShell(newShell)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />

            <SelectBox
        label="Select public keys you want to assign to this user"
        options={K_OPTIONS}
        multiOptionContainerStyle={{
          backgroundColor:'#008570'
        }}
        arrowIconColor="#008570"
        searchIconColor="#008570"
        toggleIconColor="#008570"
        selectedValues={selectedKeys}
        onMultiSelect={onMultiChange2()}
        onTapClose={onMultiChange2()}
        isMulti />
          </View>
          <View
          style={{
            padding: 20,
            width:'100%',
            alignSelf:'baseline'
          }}>
          <View style={{flexDirection:'row',justifyContent:'space-between',}}>
            <Button
              mode="contained"
              icon="send"
              style={{width:'100%'}}
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={()=>createShellUseModal(newUsername,newPassword,newGroup,newShell,selectedKeys)}
              >
              Add User
            </Button>
          </View>
          </View>
    </View>
    </ScrollView>
    </Modal>
    </>
  );
  
  function onMultiChange() {
    return (item) => setSelectedTeams(xorBy(selectedTeams, [item], 'id'))
  }

  function onMultiChange2() {
    return (item) => setSelectedKeys(xorBy(selectedKeys, [item], 'id'))
  }
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
    height:'100%',
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
});
