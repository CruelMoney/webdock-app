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
  Pressable,
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
import MenuIcon from '../assets/menu-icon.svg'
import PlusIcon from '../assets/plus-icon.svg'
import DeleteIcon from '../assets/delete-icon.svg';
import BackIcon from '../assets/back-icon.svg';

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
    deleteAccountPublicKey(userToken, pkey);
    onBackgroundRefresh();
    setIsDeleteModalVisible(false)
  };
  const Item = ({item}) => (
    <>
      <View style={{backgroundColor:'white',borderRadius:10,marginBottom:10}}>
        <View style={{display:'flex',padding:15,flexDirection:'row',
        alignItems:'center',justifyContent:'space-between'}}>
          <View>
            <Text style={{fontFamily:'Raleway-Regular',fontSize:12}}>{item.name}</Text>
            <View style={{display:'flex',flexDirection:'row'}}>
              <Text style={{width:100,fontFamily:'Raleway-Light',fontSize:10,color:'#8F8F8F'}}>{item.created}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={()=>{setIsDeleteModalVisible(true) 
            setSelectedPublicKey(item)}}><DeleteIcon /></TouchableOpacity>
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

  const EmptyListMessage = ({item}) => {
    return (
      // Flat List Item
      <Text style={styles.emptyListStyle}>No Data Found</Text>
    );
  };

  const [isDeleteModalVisible,setIsDeleteModalVisible]=React.useState(false)
  const [selectedPublicKey,setSelectedPublicKey]=React.useState("");
  return (
    <>
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',padding:'8%'}}>
      <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={navigation.goBack}><BackIcon height={45} width={50}/></TouchableOpacity>
        <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>Public keys</Text>
        <View style={{width:50}}></View>
      </View>
      <FlatList
        style={{marginTop:20}}
        data={publicKeys}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{height:60}}>
          </View>}
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
        ListEmptyComponent={EmptyListMessage}
      />
      <TouchableOpacity onPress={()=>navigation.navigate("CreatePublicKeys")} style={{position: 'absolute',right: 30,
    bottom: 30}}><PlusIcon height={50} width={50}/></TouchableOpacity>
    </View>
    <Modal
        testID={'modal'}
        isVisible={isDeleteModalVisible}
        swipeDirection={['up', 'left', 'right', 'down']}
        onSwipeComplete={()=>setIsDeleteModalVisible(false)}
        style={{justifyContent: 'flex-end',margin: 0}}>
        <View style={{backgroundColor:'white',padding:30,borderTopStartRadius:10, borderTopEndRadius:10}}>
          <Text style={{fontFamily:'Raleway-Medium',fontSize:18,color:'#00a1a1',marginVertical:10}}>Remove {selectedPublicKey?selectedPublicKey.name:null}</Text>
          <Text style={{fontFamily:'Raleway-Regular',fontSize:12,color:'#000000',marginVertical:10}}>Please confirm you want to remove this public key</Text>
          <View style={{display:'flex',flexDirection:'row',marginVertical:10}}>
            <View style={{backgroundColor:'#03A84E',width:1}}></View>
            <Text style={{fontFamily:'Raleway-Regular',fontSize:12,color:'#000000',marginStart:10}}>This will not remove any keys from any of your servers. You are simply removing this public key from the globally available keys saved against your user account.</Text>
          </View>
          <View style={{width:'100%',marginVertical:15,display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
            <TouchableOpacity onPress={()=>setIsDeleteModalVisible(false)} style={{width:'45%',height:40,backgroundColor:'#00a1a1',borderRadius:4,justifyContent:'center'}}>
                <Text style={{fontFamily:'Raleway-Bold',fontSize:16,color:"#FFFFFF",textAlign:'center'}}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>deletePublicKeyAlert(selectedPublicKey.id)} style={{width:'45%',height:40,backgroundColor:'#D94B4B',borderRadius:4,justifyContent:'center'}}>
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
