import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {IconButton, Button} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import {postAccountPublicKeys} from '../service/accountPublicKeys';

export default function CreatePublicKey({navigation}) {
  const [publicKeyName, setPublicKeyName] = React.useState('');
  const [errorPublicKeyName, setErrorPublicKeyName] = React.useState(false);
  const [publicKey, setPublicKey] = React.useState('');
  const [errorPublicKey, setErrorPublicKey] = React.useState(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setPublicKeyName('');
      setErrorPublicKeyName(false);
      setPublicKey('');
      setErrorPublicKeyName(false);
    });
    return unsubscribe;
  }, [navigation]);
  const sendRequest = async () => {
    if (publicKeyName == null || publicKeyName == '') {
      setErrorPublicKeyName(true);
      return;
    } else {
      setErrorPublicKeyName(false);
    }
    if (publicKey == null || publicKey == '') {
      setErrorPublicKey(true);
      return;
    } else {
      setErrorPublicKey(false);
    }
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    postAccountPublicKeys(userToken, publicKeyName, publicKey);
    navigation.goBack();
  };
  return (
    <View>
      <View style={styles.closebutton}>
        <IconButton
          icon="close"
          color="black"
          size={25}
          onPress={() => navigation.goBack()}
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
          error={errorPublicKeyName}
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
          error={errorPublicKey}
          style={{paddingTop: 20}}
        />
      </View>
      <View style={{padding: 20}}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  closebutton: {
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 20,
    textAlign: 'center',
  },
});
