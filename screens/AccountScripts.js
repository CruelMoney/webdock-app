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
import DeleteIcon from '../assets/delete-icon.svg'
import EditIcon from '../assets/edit-icon.svg'
import BackIcon from '../assets/back-icon.svg'
import PlusIcon from '../assets/plus-icon.svg'
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
    var result = await deleteAccountScript(userToken, pkey);
    if (result == 200) {
      onBackgroundRefresh();
      try {
        setIsDeleteModalVisible(false)
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
    } else if (result == 404) {
      try {
        setIsDeleteModalVisible(false)
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
  };
  const Item = ({item}) => (
    <View style={{backgroundColor:'white',borderRadius:10,marginBottom:10}}>
        <View style={{display:'flex',padding:15,flexDirection:'row',
        alignItems:'center',justifyContent:'space-between'}}>
          <View>
            <Text style={{fontFamily:'Raleway-Regular',fontSize:12}}>{item.name}</Text>
            <View style={{display:'flex',flexDirection:'row'}}>
              <Text style={{width:100,fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{item.filename}</Text>
            </View>
          </View><View style={{display:'flex',flexDirection:'row'}}>
          <TouchableOpacity onPress={()=>navigation.navigate("EditAccountScript",item)}><EditIcon width={25} height={25} /></TouchableOpacity>
            <View style={{width:10}}></View>
                      <TouchableOpacity onPress={()=>{setIsDeleteModalVisible(true) 
            setSelectedScript(item)}}><DeleteIcon width={25} height={25}/></TouchableOpacity>
          </View>
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

  const [isDeleteModalVisible,setIsDeleteModalVisible]=React.useState(false)
  const [selectedScript,setSelectedScript]=React.useState()
  return (
    <>
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',padding:'8%'}}>
      <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={navigation.goBack}><BackIcon height={45} width={50}/></TouchableOpacity>
        <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>Scripts</Text>
        <TouchableOpacity onPress={()=>navigation.navigate("CreateAccountScript")}><PlusIcon height={45} width={45}/></TouchableOpacity>
      </View>
      <FlatList
        style={{marginTop:20}}
        data={scripts}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity>
            <View>
              <Item item={item} />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
    </View>
    <Modal
        testID={'modal'}
        isVisible={isDeleteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={()=>setIsDeleteModalVisible(false)}
        style={{justifyContent: 'flex-end',margin: 0}}>
        <View style={{backgroundColor:'white',padding:30,borderTopStartRadius:10, borderTopEndRadius:10}}>
          <Text style={{fontFamily:'Raleway-Medium',fontSize:18,color:'#00a1a1',marginVertical:10}}>Remove {selectedScript?selectedScript.name:null}</Text>
          <Text style={{fontFamily:'Raleway-Regular',fontSize:12,color:'#000000',marginVertical:10}}>Please confirm you want to remove this script</Text>
          <View style={{display:'flex',flexDirection:'row',marginVertical:10}}>
            <View style={{backgroundColor:'#03A84E',width:1}}></View>
            <Text style={{fontFamily:'Raleway-Regular',fontSize:12,color:'#000000',marginStart:10}}>This will not remove any scripts from any of your servers. You are simply removing this script from the globally available scripts saved against your user account.</Text>
          </View>
          <View style={{width:'100%',marginVertical:15,display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <TouchableOpacity onPress={()=>setIsDeleteModalVisible(false)} style={{width:'45%',height:40,backgroundColor:'#00a1a1',borderRadius:4,justifyContent:'center'}}>
                <Text style={{fontFamily:'Raleway-Bold',fontSize:16,color:"#FFFFFF",textAlign:'center'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>deleteScriptAlert(selectedScript.id)} style={{width:'45%',height:40,backgroundColor:'#D94B4B',borderRadius:4,justifyContent:'center'}}>
                <Text style={{fontFamily:'Raleway-Bold',fontSize:16,color:"#FFFFFF",textAlign:'center'}}>Delete</Text>
            </TouchableOpacity>
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
