import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {
  IconButton,
  Button,
  Divider,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import {postAccountPublicKeys} from '../service/accountPublicKeys';
import {postAccountScripts} from '../service/accountScripts';
import Toast from 'react-native-toast-message';

export default function CreateAccountScript({navigation}) {
  const [scriptName, setScriptName] = React.useState('');
  const [scriptFileName, setScriptFileName] = React.useState('');
  const [scriptFileContent, setScriptFileContent] = React.useState('');
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScriptName('');
      setScriptFileName('');
      setScriptFileContent('');
    });

    return unsubscribe;
  }, [navigation]);
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await postAccountScripts(
      userToken,
      scriptName,
      scriptFileName,
      scriptFileContent,
    );
    if (result.status == 201) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'The newly created account script',
          visibilityTime: 4000,
          autoHide: true,
          onShow: () => {
            setButtonDisabled(true);
          },
          onHide: () => {
            setButtonDisabled(false);
          },
        });
      } catch (e) {
        alert(e);
      }
      navigation.goBack();
    } else if (result.status == 400) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: result.response.message,
          visibilityTime: 4000,
          autoHide: true,
          onShow: () => {
            setButtonDisabled(true);
          },
          onHide: () => {
            setButtonDisabled(false);
          },
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  const [buttonDisabled, setButtonDisabled] = useState(false);
  return (
    <View style={{height: Dimensions.get('window').height}}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
        style={{backgroundColor: 'white', paddingBottom: 20}}>
        <View style={{flex: 1, justifyContent: 'flex-start'}}>
          <View style={styles.closebutton}>
            <IconButton
              icon="close"
              color="black"
              size={25}
              onPress={() => navigation.goBack()}
            />
          </View>

          <Text style={styles.titleText}>Add Script to account</Text>
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
          <Text style={{marginBottom: 20}}>
            This will add a globally available File or Script to your account
            which you can deploy to any server.
          </Text>
          <Button
            mode="contained"
            disabled={buttonDisabled}
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
