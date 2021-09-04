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
} from 'react-native-paper';
import {Avatar, Divider} from 'react-native-paper';
import {
  deleteAccountScript,
  getAccountScripts,
} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
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
      <View style={styles.status}>
        <Icon
          name="clear"
          size={25}
          color="green"
          onPress={() => {
            deleteScriptAlert(item.id);
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

  return (
    <View width="100%" height="100%">
      <FlatList
        data={scripts}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('EditAccountScript', {item: item})
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
        onPress={() => navigation.navigate('CreateAccountScript')}
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
