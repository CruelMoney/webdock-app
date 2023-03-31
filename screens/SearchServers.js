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
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FAB, Searchbar} from 'react-native-paper';

import {Avatar, Divider} from 'react-native-paper';
import {getServers} from '../service/servers';
import {AuthContext} from '../components/context';
import AsyncStorage from '@react-native-community/async-storage';
export default function SearchServers({navigation}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => setSearchQuery(query);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TextInput
          autoFocus
          placeholderTextColor={'white'}
          selectionColor={'white'}
          placeholder="  Search"
          onChangeText={text => {
            onChangeSearch(text);
            search();
          }}
          value={searchQuery}
          style={{color: 'white'}}
        />
      ),
    });
  });

  const search = () => {
    const newData = servers.filter(item => {
      const itemData = `${item.slug.toUpperCase()} 
                      ${item.location.toUpperCase()} 
                      ${item.ipv4.toUpperCase()}
                      ${item.ipv6.toUpperCase()}`;

      const textData = searchQuery.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });

    setFilteredServers(newData);
  };

  const [servers, setServers] = useState();
  const [filteredServers, setFilteredServers] = useState();

  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getServers(userToken).then(data => {
          setServers(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);
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

  return (
    <View width="100%" height="100%">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={searchQuery.length == 0 ? servers : filteredServers}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ServerManagement')}>
            <View>
              <Item
                title={item.slug}
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
