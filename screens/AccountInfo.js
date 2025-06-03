import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Linking, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {TextInput} from 'react-native-paper';
import BackIcon from '../assets/back-icon.svg';
import {getAccountInformations} from '../service/accountInformations';

export default function AccountInfo({navigation}) {
  const [account, setAccount] = useState();
  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAccountInformations(userToken).then(data => {
          setAccount(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
  }, []);
  const handleClick = url => {
    if (!url.includes('https://') && !url.includes('http://')) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };
  return (
    <View
      width="100%"
      height="100%"
      style={{backgroundColor: '#F4F8F8', padding: '8%'}}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity onPress={navigation.goBack}>
          <BackIcon height={45} width={50} />
        </TouchableOpacity>
        <Text
          style={{
            color: '#00A1A1',
            fontFamily: 'Raleway-Medium',
            fontSize: 20,
            textAlign: 'center',
          }}>
          General
        </Text>
        <View style={{width: 50}}></View>
      </View>
      {account ? (
        <>
          <View style={{marginTop: 20}}>
            <Text style={{fontFamily: 'Raleway-Medium', fontSize: 18}}>
              Basic Information
            </Text>
            <TextInput
              mode="outlined"
              label="Name"
              value={account.userName}
              autoFocus={true}
              editable={false}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              style={{
                marginTop: 10,
                fontFamily: 'Raleway-Regular',
                fontSize: 16,
              }}
            />
            <TextInput
              mode="outlined"
              label="Email"
              value={account.userEmail}
              autoFocus={true}
              editable={false}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              style={{
                marginTop: 10,
                fontFamily: 'Raleway-Regular',
                fontSize: 16,
              }}
            />
            <TextInput
              mode="outlined"
              label="Company Name"
              value={account.companyName}
              autoFocus={true}
              editable={false}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              style={{
                marginTop: 10,
                fontFamily: 'Raleway-Regular',
                fontSize: 16,
              }}
            />
            <TextInput
              mode="outlined"
              label="Account Credit Balance"
              value={
                account.accountBalanceRaw + ' ' + account.accountBalanceCurrency
              }
              autoFocus={true}
              editable={false}
              selectionColor="#00A1A1"
              dense={true}
              outlineColor="#00A1A1"
              activeOutlineColor="#00A1A1"
              underlineColorAndroid="transparent"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{
                colors: {
                  primary: '#00a1a1',
                  accent: '#00a1a1',
                  placeholder: '#00A1A1',
                },
              }}
              style={{
                marginTop: 10,
                fontFamily: 'Raleway-Regular',
                fontSize: 16,
              }}
            />
            <TouchableOpacity
              onPress={() =>
                handleClick(
                  'https://webdock.io/en/docs/webdock/billing-pricing',
                )
              }
              style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
              <View style={{backgroundColor: '#03A84E', width: 1}}></View>
              <Text
                style={{
                  fontFamily: 'Raleway-Regular',
                  fontSize: 14,
                  color: '#5F5F5F',
                  marginStart: 10,
                }}>
                Want to know how to get credit? Click here!
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#008570" />
        </View>
      )}
    </View>
  );
}
