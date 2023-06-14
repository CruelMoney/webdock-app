import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useFocusEffect, useState} from 'react';
import {View, Text, ScrollView, StyleSheet, Dimensions} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {LogInScreen} from './LogInScreen';
import {HomeScreen} from './HomeScreen';
import ServerOverview from './ServerOverview';
import ServerActivity from './ServerActivity';
import ServerEvents from './ServerEvents';
import ServerSnapshots from './ServerSnapshots';
import ServerShellUsers from './ServerShellUsers';
import ServerScripts from './ServerScripts';
import UpdateServerMetadata from './UpdateServerMetadata';
import Header from '../shared/header';
import {IconButton, TextInput, Button} from 'react-native-paper';
import {getServerBySlug, updateServerMetadata} from '../service/servers';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import CreateServerSnapshot from './CreateServerSnapshot';
import {createServerScript} from '../service/serverScripts';
import CreateServerScript from './CreateServerScript';
import CreateServerShellUsers from './CreateServerShellUsers';
import ChangeProfile from './ChangeProfile';

const Stack = createStackNavigator();
export function ServerManagement({route, navigation}) {
  useEffect(() => {
    setTimeout(() => {
      console.log(route.params);
      navigation.setOptions({
        headerTitle: route.params.slug,
      });
    }, 0);
  }, []);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    setName(route.params.name);
    setDescription(route.params.description);
    setNotes(route.params.notes);
    setDate(new Date(route.params.nextActionDate) || new Date());
  };
  const [name, setName] = React.useState();
  const [description, setDescription] = React.useState();
  const [notes, setNotes] = React.useState();
  const [nextActionDate, setNextActionDate] = React.useState();

  const [date, setDate] = useState(
    new Date(route.params.nextActionDate) || new Date(),
  );

  const [fdate, setFDate] = useState(
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0],
  );
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    console.log(currentDate);
    setFDate(
      new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0],
    );
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await updateServerMetadata(
      userToken,
      route.params.slug,
      name,
      description,
      notes,
      fdate,
    );
    if (result.status == 200) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server updated',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
    } else if (result.status == 404) {
      try {
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found!',
          visibilityTime: 4000,
          autoHide: true,
        });
      } catch (e) {
        alert(e);
      }
      toggleModal();
    }
  };

  return (
    <>
      <Stack.Navigator
        initialRouteName="Overview"
        screenOptions={{headerShown: true}}>
        <Stack.Screen
          name="Overview"
          component={ServerOverview}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="Activity"
          component={ServerActivity}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="Events"
          component={ServerEvents}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="Snapshots"
          component={ServerSnapshots}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="Shell Users"
          component={ServerShellUsers}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="Scripts"
          component={ServerScripts}
          options={{
            headerShown: false,
          }}
          initialParams={{slug: route.params.slug, name: route.params.name}}
        />
        <Stack.Screen
          name="UpdateServerMetadata"
          component={UpdateServerMetadata}
          options={{
            headerShown: false,
          }}
          initialParams={{
            slug: route.params.slug,
            name: route.params.name,
            nextActionDate: route.params.nextActionDate,
            description: route.params.description,
            notes: route.params.notes,
          }}
        />
        <Stack.Screen
          name="ChangeProfile"
          component={ChangeProfile}
          options={{
            headerShown: false,
          }}
          initialParams={{
            slug: route.params.slug,
            name: route.params.name,
            location: route.params.location,
            profile: route.params.profile,
          }}
        />
        <Stack.Screen
          name="CreateServerSnapshot"
          component={CreateServerSnapshot}
          options={{
            headerShown: false,
          }}
          initialParams={{
            slug: route.params.slug,
            name: route.params.name,
          }}
        />
        <Stack.Screen
          name="CreateServerScript"
          component={CreateServerScript}
          options={{
            headerShown: false,
          }}
          initialParams={{
            slug: route.params.slug,
            name: route.params.name,
          }}
        />
        <Stack.Screen
          name="CreateServerShellUsers"
          component={CreateServerShellUsers}
          options={{
            headerShown: false,
          }}
          initialParams={{
            slug: route.params.slug,
            name: route.params.name,
          }}
        />
      </Stack.Navigator>
      <Modal isVisible={isModalVisible} style={{margin: 0}}>
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
                onPress={() => toggleModal()}
              />
            </View>

            <Text style={styles.titleText}>Update Server Metadata</Text>
            <View style={{padding: 20}}>
              <TextInput
                mode="outlined"
                label="Name"
                value={name}
                onChangeText={name => setName(name)}
                theme={{
                  colors: {
                    primary: '#00a1a1',
                  },
                }}
              />
              <TextInput
                mode="outlined"
                label="Description"
                value={description}
                onChangeText={description => setDescription(description)}
                theme={{
                  colors: {
                    primary: '#00a1a1',
                  },
                }}
              />
              <TouchableOpacity onPress={showDatepicker}>
                <TextInput
                  mode="outlined"
                  label="Next Action Date"
                  disabled
                  value={fdate.toString()}
                  onChangeText={nextActionDate => setFDate(nextActionDate)}
                  theme={{
                    colors: {
                      primary: '#00a1a1',
                    },
                  }}
                />
              </TouchableOpacity>
              <TextInput
                mode="outlined"
                label="Notes"
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={notes => setNotes(notes)}
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
            <Button
              mode="contained"
              theme={{
                colors: {
                  primary: '#008570',
                },
              }}
              onPress={sendRequest}>
              Update Server Metadata
            </Button>
          </View>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              maximumDate={new Date('2100-01-01T12:00:00.000Z')}
              minimumDate={new Date()}
              display="default"
              onChange={onChange}
            />
          )}
        </ScrollView>
      </Modal>
    </>
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
