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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FAB, Searchbar} from 'react-native-paper';

import {Avatar, Divider} from 'react-native-paper';
import {getServers} from '../service/servers';
import {AuthContext} from '../components/context';
import AsyncStorage from '@react-native-community/async-storage';
export function HomeScreen({navigation}) {
  const [servers, setServers] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onBackgroundRefresh();
      setServers([]);
    });
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServers(userToken).then(data => {
          const sorter = (a, b) => {
            var dA = a.date.split(' ');
            var dB = b.date.split(' ');
            var dateA = Date.parse(dA[0] + 'T' + dA[1]),
              dateB = Date.parse(dB[0] + 'T' + dB[1]);

            return dateB - dateA;
          };

          setServers(data.sort(sorter));
        });
      } catch (e) {
        alert(e);
      }
    }, 1000);
    return unsubscribe;
  }, [navigation]);
  const onBackgroundRefresh = async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServers(userToken).then(data => {
        const sorter = (a, b) => {
          var dA = a.date.split(' ');
          var dB = b.date.split(' ');
          var dateA = Date.parse(dA[0] + 'T' + dA[1]),
            dateB = Date.parse(dB[0] + 'T' + dB[1]);

          return dateB - dateA;
        };

        setServers(data.sort(sorter));
      });
    } catch (e) {
      alert(e);
    }
  };
  const Item = ({title, alias, dc, profile, ipv4}) => (
    <View style={styles.item}>
      <View style={styles.logo}>
        <Avatar.Image
          source={{
            uri: 'https://logo.clearbit.com/' + alias,
          }}
          theme={{colors: {primary: 'transparent'}}}
          style={styles.logoitem}
        />
      </View>
      <View style={styles.midinfo}>
        <Text style={styles.hostname}>{title}</Text>
        <Text style={styles.datacenterandprofile}>
          {
            <Image
              source={
                dc === 'fi'
                  ? {
                      uri:
                        'https://api.webdock.io/concrete/images/countries/europeanunion.png',
                    }
                  : {
                      uri:
                        'https://api.webdock.io/concrete/images/countries/us.png',
                    }
              }
            />
          }{' '}
          {profile}
        </Text>
        <Text style={styles.ipv4}>{ipv4}</Text>
      </View>
      <View style={styles.status}>
        <Icon name="power-settings-new" size={25} color="green" />
      </View>
    </View>
  );
  const [isFetching, setIsFetching] = useState(false);
  const onRefresh = async () => {
    setIsFetching(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getServers(userToken).then(data => {
        const sorter = (a, b) => {
          var dA = a.date.split(' ');
          var dB = b.date.split(' ');
          var dateA = Date.parse(dA[0] + 'T' + dA[1]),
            dateB = Date.parse(dB[0] + 'T' + dB[1]);

          return dateB - dateA;
        };

        setServers(data.sort(sorter));
        setIsFetching(false);
      });
    } catch (e) {
      alert(e);
    }
  };

  return (
    <View width="100%" height="100%">
      <FlatList
        data={servers}
        onRefresh={() => onRefresh()}
        refreshing={isFetching}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ServerManagement', {
                slug: item.slug,
                name: item.name,
                description: item.description,
                notes: item.notes,
                nextActionDate: item.nextActionDate,
              })
            }>
            <View>
              <Item
                title={item.name}
                alias={item.aliases[0]}
                dc={item.location}
                profile={item.profile}
                ipv4={item.ipv4}
              />
              <Divider />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.slug}
      />
      <FAB
        style={styles.fab}
        color="white"
        icon="plus"
        animated={true}
        accessibilityLabel="Create new server"
        onPress={() => console.log('Pressed')}
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
  logo: {
    width: '20%',
    alignItems: 'center',
  },
  logoitem: {},
  midinfo: {
    width: '65%',
    flex: 1,
    textAlign: 'left',
    marginHorizontal: '5%',
    justifyContent: 'center', //Centered vertically
    flex: 1,
  },
  status: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostname: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'bold',
    textAlignVertical: 'center',
  },
  datacenterandprofile: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'normal',
    textAlignVertical: 'center',
  },
  ipv4: {
    height: '33%',
    fontSize: 12,
    fontWeight: 'normal',
    textAlignVertical: 'center',
  },
  fab: {
    backgroundColor: 'red',
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
