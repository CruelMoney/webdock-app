import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
import {
  patchAccountScripts,
  postAccountScripts,
} from '../service/accountScripts';
import Toast from 'react-native-toast-message';
import {getServerBySlug, updateServerMetadata} from '../service/servers';
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';
import DeleteIcon from '../assets/delete-icon.svg';
import EditIcon from '../assets/edit-icon.svg';
import BackIcon from '../assets/back-icon.svg';
import PlusIcon from '../assets/plus-icon.svg';
import PlayIcon from '../assets/play-icon.svg';
import LinearGradient from 'react-native-linear-gradient';
import {Keyboard} from 'react-native';
import {ActivityIndicator} from 'react-native';
import GradientButton from '../components/GradientButton';

export default function UpdateServerMetadata({route, navigation}) {
  const [inputs, setInputs] = React.useState({
    name: route.params.name,
    description: '',
    actionDate: new Date(route.params.nextActionDate) || new Date(),
    notes: route.params.notes,
  });
  const [errors, setErrors] = React.useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // onBackgroundRefresh();
    });

    setTimeout(async () => {}, 0);
    return unsubscribe;
  }, [route]);
  const sendRequest = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await updateServerMetadata(
      userToken,
      route.params.slug,
      inputs['name'],
      inputs['description'],
      inputs['notes'],
      fdate,
    );
    if (result.status == 200) {
      try {
        navigation.goBack();
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server metadata updated',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
    } else if (result.status == 404) {
      try {
        navigation.goBack();
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Server not found!',
          visibilityTime: 4000,
          autoHide: true,
          onPress: () => navigation.navigate('Events'),
        });
      } catch (e) {
        alert(e);
      }
    }
  };
  //datepicker
  const [date, setDate] = useState(
    new Date(Date.now()) || new Date(route.params.nextActionDate),
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

  const validate = () => {
    Keyboard.dismiss();
    setSubmitting(true);
    let isValid = true;

    if (!inputs.name) {
      handleError('Server name is required', 'name');
      isValid = false;
    }

    if (isValid) {
      sendRequest();
    } else {
      setSubmitting(false);
    }
  };
  const handleOnchange = (text, input) => {
    setInputs(prevState => ({...prevState, [input]: text}));
  };
  const handleError = (error, input) => {
    setErrors(prevState => ({...prevState, [input]: error}));
  };
  const [submitting, setSubmitting] = useState(false);

  return (
    <SafeAreaView>
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
            Edit metadata
          </Text>
          <View style={{width: 50}}></View>
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}>
          <View style={{flex: 1, justifyContent: 'flex-start'}}>
            <View
              style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
              <View style={{backgroundColor: '#03A84E', width: 1}}></View>
              <Text
                style={{
                  fontFamily: 'Raleway-Regular',
                  fontSize: 12,
                  color: '#5F5F5F',
                  marginStart: 10,
                }}>
                Changing the name field just updates the descriptive name for
                your Server and does not affect the unique server shortname
                (slug)
              </Text>
            </View>
            <View style={{marginTop: 15}}>
              <TextInput
                mode="outlined"
                label="Server name"
                value={inputs['name']}
                onChangeText={text => handleOnchange(text, 'name')}
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
                onFocus={() => handleError(null, 'name')}
                error={errors.name}
              />
              <HelperText type="error" visible={errors.name}>
                {errors.name}
              </HelperText>
              {/* <TextInput
                mode="outlined"
                label="What's installed here?"
                value={inputs['description']}
                onChangeText={text => handleOnchange(text, 'description')}
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
                onFocus={() => handleError(null, 'description')}
                error={errors.description}
              />
              <HelperText type="error" visible={errors.description}>
                {errors.description}
              </HelperText> */}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: 20,
                }}>
                <View style={{backgroundColor: '#03A84E', width: 1}}></View>
                <Text
                  style={{
                    fontFamily: 'Raleway-Regular',
                    fontSize: 12,
                    color: '#5F5F5F',
                    marginStart: 10,
                  }}>
                  Here you can define a date where you need to take some action
                  regarding this server. You can then sort your server list by
                  this date in Metadata view on the All Servers page once logged
                  in to the Web Dashboard.
                </Text>
              </View>
              <TouchableOpacity onPress={showDatepicker}>
                <TextInput
                  mode="outlined"
                  label="Next Action Date"
                  editable={false}
                  value={fdate.toString()}
                  onChangeText={nextActionDate => setFDate(nextActionDate)}
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
                  onFocus={() => handleError(null, 'actionDate')}
                  error={errors.actionDate}
                />
                <HelperText type="error" visible={errors.actionDate}>
                  {errors.actionDate}
                </HelperText>
              </TouchableOpacity>
              <TextInput
                mode="outlined"
                label="Internal notes or comments"
                multiline
                numberOfLines={5}
                value={inputs['notes']}
                onChangeText={text => handleOnchange(text, 'notes')}
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
                onFocus={() => handleError(null, 'notes')}
                error={errors.notes}
              />
              <HelperText type="error" visible={errors.notes}>
                {errors.notes}
              </HelperText>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity onPress={validate}>
              <GradientButton text={'Update Data'} submitting={submitting} />
              {/* <LinearGradient locations={[0.29,0.80]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={['#00A1A1', '#03A84E']} style={{borderRadius:5}}>
              {!submitting?
                <Text style={{padding:15,fontFamily:'Raleway-Bold',fontSize:18,color:'white',textAlign:'center'}}>
                  Update Data
                </Text>:
                <ActivityIndicator size="large" color="#ffffff" style={{padding:10}} />
              }
            </LinearGradient> */}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
      </View>
    </SafeAreaView>
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
