import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Picker,
} from 'react-native';
import {
  IconButton,
  Button,
  Divider,
  HelperText,
  Snackbar,
  Checkbox,
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

import {TextInput} from 'react-native-paper';
import * as Yup from 'yup';
import {postAccountPublicKeys} from '../service/accountPublicKeys';
import {getAccountScripts, postAccountScripts} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import {
  createServerScript,
  executeServerScript,
} from '../service/serverScripts';

export default function CreateServerScript({route, navigation}) {
  const [selectedScript, setSelectedScript] = React.useState('');
  const [filepath, setFilepath] = React.useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSelectedScript('');
      setFilepath('');
      setCheckedExecutable(false);
      setCheckedRunThisNow(false);
    });
    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getAccountScripts(userToken).then(data => {
          var array = [];
          data.map(item => {
            array.push({label: item.name, value: item.id, key: item.id});
          });
          setModifiedScripts(array);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);

    return unsubscribe;
  }, [navigation]);
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await createServerScript(
      userToken,
      route.params.slug,
      selectedScript,
      filepath,
      checkedExecutable,
      checkedRunThisNow,
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server script deployment initiated',
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
    } else if (result.status == 404) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server or script not found!',
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
  const [checkedExecutable, setCheckedExecutable] = React.useState(false);
  const [checkedRunThisNow, setCheckedRunThisNow] = React.useState(false);

  const [modifiedScripts, setModifiedScripts] = useState();

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

          <Text style={styles.titleText}>Deploy a Script or File</Text>
          <View style={{padding: 20}}>
            {modifiedScripts ? (
              <RNPickerSelect
                style={{
                  inputIOS: {
                    color: 'black',
                    paddingTop: 13,
                    paddingHorizontal: 10,
                    paddingBottom: 12,
                  },
                  inputAndroid: {
                    color: 'black',
                  },
                  placeholderColor: 'black',
                }}
                onValueChange={value => setSelectedScript(value)}
                items={modifiedScripts}
              />
            ) : (
              <View>
                <Text>Loading</Text>
              </View>
            )}

            <TextInput
              mode="outlined"
              label="Absolute path and filename on server"
              value={filepath}
              onChangeText={filepath => setFilepath(filepath)}
              theme={{
                colors: {
                  primary: '#00a1a1',
                },
              }}
            />
          </View>
          <View style={{paddingLeft: 20}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedExecutable ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedExecutable(!checkedExecutable);
                }}
              />
              <Text>Make file executable</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Checkbox
                status={checkedRunThisNow ? 'checked' : 'unchecked'}
                onPress={() => {
                  setCheckedRunThisNow(!checkedRunThisNow);
                }}
              />
              <Text>Run this now</Text>
            </View>
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
            disabled={buttonDisabled}
            theme={{
              colors: {
                primary: '#008570',
              },
            }}
            onPress={sendRequest}>
            Deploy this Script
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
