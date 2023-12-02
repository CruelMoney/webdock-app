import AsyncStorage from '@react-native-community/async-storage';
import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  UIManager,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import {
  Card,
  Provider,
  Title,
  Menu,
  Button,
  Divider,
  TextInput,
  IconButton,
  Paragraph,
  DataTable,
  Checkbox,
  Colors,
  Snackbar,
  Badge,
} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import {getProfiles} from '../service/serverConfiguration';
import SVGCpu from '../assets/icon-cpu.svg';
import SVGRam from '../assets/icon-ram2.svg';
import SVGStorage from '../assets/icon-storage.svg';
import SVGWifi from '../assets/icon-wifi.svg';
import DoneIcon from '../assets/done-icon.svg';
import SVGSelected from '../assets/done-icon.svg';
import SVGLocation from '../assets/icon-location.svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  changeServerProfile,
  dryRunForServerProfileChange,
} from '../service/serverActions';
import {TouchableOpacity} from 'react-native-gesture-handler';
import GradientButton from '../components/GradientButton';
import BackIcon from '../assets/back-icon.svg';

export default function ChangeProfile({navigation, route}) {
  const [profiles, setProfiles] = React.useState([]);
  const [dryRun, setDryRun] = React.useState();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //onBackgroundRefresh();
    });

    setTimeout(async () => {
      try {
        getAllProfiles(route.params.location);
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);
  var currency_symbols = {
    USD: '$', // US Dollar
    EUR: '€', // Euro
    CRC: '₡', // Costa Rican Colón
    GBP: '£', // British Pound Sterling
    ILS: '₪', // Israeli New Sheqel
    INR: '₹', // Indian Rupee
    JPY: '¥', // Japanese Yen
    KRW: '₩', // South Korean Won
    NGN: '₦', // Nigerian Naira
    PHP: '₱', // Philippine Peso
    PLN: 'zł', // Polish Zloty
    PYG: '₲', // Paraguayan Guarani
    THB: '฿', // Thai Baht
    UAH: '₴', // Ukrainian Hryvnia
    VND: '₫', // Vietnamese Dong
  };
  const getAllProfiles = async lc => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      getProfiles(userToken, lc).then(data => {
        data.map(item => {
          item.isExpanded = false;
        });
        setProfiles(data);
      });
    } catch (e) {
      alert(e);
    }
  };
  const ExpandableComponent = ({item, onClickFunction}) => {
    const [layoutHeight, setLayoutHeight] = useState(0);

    useEffect(() => {
      if (item.isExpanded) {
        setLayoutHeight(null);
        setSelectedPlan(item);
      } else {
        setLayoutHeight(0);
      }
    }, [item.isExpanded]);
    return (
      <>
        <Card
          style={{
            borderColor: item.isExpanded ? '#00a1a1' : '#eee',
            borderWidth: item.isExpanded ? 2 : 1,
            marginVertical: 10,
            borderRadius: 8,
            overflow: 'hidden',
          }}
          onPress={onClickFunction}>
          <Card.Title
            titleStyle={{
              color: item.isExpanded ? '#00a1a1' : 'black',
              fontFamily: 'Raleway-Bold',
              fontSize: 16,
              includeFontPadding: false,
            }}
            title={item.name}
            right={() => (
              <Title
                style={{
                  color: item.isExpanded ? '#00a1a1' : 'black',
                  marginRight: 20,
                  fontFamily: 'Raleway-Bold',
                  fontSize: 18,
                  includeFontPadding: false,
                }}>
                {item.price.amount / 100 + ' ' + item.price.currency + ' '}
                <Text
                  style={{
                    includeFontPadding: false,
                    fontFamily: 'Raleway-Regular',
                    fontSize: 9,
                  }}>
                  /mo
                </Text>
              </Title>
            )}
          />
          {item.isExpanded ? <Divider /> : null}
          {item.isExpanded ? (
            <Card.Content style={{height: layoutHeight, overflow: 'hidden'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                }}>
                <SVGCpu height={30} width={30} color="#787878" />
                <Text
                  style={{
                    width: '85%',
                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    fontSize: 12,
                    includeFontPadding: false,
                  }}>
                  {item.cpu.cores + ' Cores,' + item.cpu.threads + ' Threads'}
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                }}>
                <View>
                  <SVGRam height={30} width={30} color="#787878" />
                </View>
                <Text
                  style={{
                    width: '85%',
                    textAlign: 'left',
                    includeFontPadding: false,

                    fontFamily: 'Raleway-SemiBold',
                    fontSize: 12,
                  }}>
                  {Math.round(item.ram * 0.001048576 * 100) / 100 + ' GB RAM'}
                </Text>
              </View>

              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                }}>
                <SVGStorage height={30} width={30} color="#787878" />
                <Text
                  style={{
                    width: '85%',
                    textAlign: 'left',
                    includeFontPadding: false,

                    fontFamily: 'Raleway-SemiBold',
                    fontSize: 12,
                    justifyContent: 'space-between',
                  }}>
                  {Math.round(item.disk * 0.001048576 * 100) / 100 +
                    ' GB On-Board SSD Drive'}
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 14,
                  justifyContent: 'space-between',

                  paddingHorizontal: 10,
                }}>
                <SVGWifi height={30} width={30} color="#787878" />
                <Text
                  style={{
                    width: '85%',
                    includeFontPadding: false,

                    textAlign: 'left',
                    fontFamily: 'Raleway-SemiBold',
                    fontSize: 12,
                  }}>
                  1 Gbit/s-Port
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                  paddingHorizontal: 10,
                }}>
                <SVGLocation height={30} width={30} />
                <Text
                  style={{
                    width: '85%',
                    textAlign: 'left',
                    includeFontPadding: false,

                    fontFamily: 'Raleway-SemiBold',
                    fontSize: 12,
                  }}>
                  1 dedicated IPv4 address
                </Text>
              </View>
            </Card.Content>
          ) : null}
        </Card>
      </>
    );
  };
  const [selectedPlan, setSelectedPlan] = useState();
  const [itemsCharge, setItemsCharge] = useState();
  useEffect(() => {
    if (selectedPlan != null) {
      setTimeout(async () => {
        let userToken = null;
        try {
          userToken = await AsyncStorage.getItem('userToken');
          dryRunForServerProfileChange(
            userToken,
            route.params.slug,
            selectedPlan.slug,
          ).then(data => {
            if (selectedPlan.slug != route.params.slug) {
              setDryRun(data);
              setItemsCharge([...data.response.chargeSummary.items]);
            }
          });
        } catch (e) {
          alert(e);
        }
      }, 0);
    }
  }, [selectedPlan]);
  const updateLayout = index => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    const array = [...profiles];
    array.map((value, placeindex) =>
      placeindex === index
        ? (array[placeindex]['isExpanded'] = !array[placeindex]['isExpanded'])
        : (array[placeindex]['isExpanded'] = false),
    );
    setProfiles(array);
  };
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const [checkedBox, setCheckedBox] = useState(false);

  const changeProfile = async () => {
    let userToken = null;
    userToken = await AsyncStorage.getItem('userToken');
    let result = await changeServerProfile(
      userToken,
      route.params.slug,
      selectedPlan.slug,
    );
    if (result.status == 202) {
      try {
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Server Profile Change initiated',
          visibilityTime: 4000,
          autoHide: true,
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
        });
      } catch (e) {
        alert(e);
      }
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
    }
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
          }}>
          Change Profile
        </Text>
        <View style={{width: 50}}></View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>
        <View>
          <View style={{paddingTop: 10}}>
            <SectionTitle title={'Your Current Server Profile'} />
            {profiles
              ? profiles.map((gr, key) =>
                  route.params.profile == gr.slug ? (
                    <ExpandableComponent
                      key={gr.slug}
                      item={gr}
                      onClickFunction={() => {
                        updateLayout(key);
                      }}
                    />
                  ) : null,
                )
              : null}
            <SectionTitle title={'Select a New Hardware Profile'} />
            {profiles
              ? profiles
                  .filter(item =>
                    route.params.profile.includes('ryzen')
                      ? item.slug.includes('ryzen')
                      : !item.slug.includes('ryzen'),
                  )
                  .map((gr, key) =>
                    route.params.profile != gr.slug ? (
                      <ExpandableComponent
                        key={gr.slug}
                        item={gr}
                        onClickFunction={() => {
                          updateLayout(key);
                        }}
                      />
                    ) : null,
                  )
              : null}
            {itemsCharge && selectedPlan ? (
              selectedPlan.slug != route.params.profile ? (
                <View>
                  <Text style={styles.contentTitle}>Summary</Text>

                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Name - Profile - Period</DataTable.Title>
                      <DataTable.Title numeric>Price</DataTable.Title>
                    </DataTable.Header>

                    {itemsCharge
                      ? itemsCharge.map(item => (
                          <DataTable.Row key={item.text}>
                            <DataTable.Cell
                              style={{fontFamily: 'Raleway-Regular'}}>
                              {item.text}
                            </DataTable.Cell>
                            <DataTable.Cell numeric>
                              {item.price.amount / 100 +
                                ' ' +
                                currency_symbols[item.price.currency]}
                            </DataTable.Cell>
                          </DataTable.Row>
                        ))
                      : null}
                  </DataTable>
                  <DataTable style={{width: '50%', alignSelf: 'flex-end'}}>
                    <DataTable.Row>
                      <DataTable.Cell>Subtotal</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {dryRun
                          ? dryRun.response
                            ? dryRun.response.chargeSummary.total.subTotal
                                .amount /
                                100 +
                              ' ' +
                              currency_symbols[
                                dryRun.response.chargeSummary.total.subTotal
                                  .currency
                              ]
                            : null
                          : null}
                      </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                      <DataTable.Cell>VAT</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {dryRun
                          ? dryRun.response
                            ? dryRun.response.chargeSummary.total.vat.amount /
                                100 +
                              ' ' +
                              currency_symbols[
                                dryRun.response.chargeSummary.total.vat.currency
                              ]
                            : null
                          : null}
                      </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row style={{borderColor: 'red'}}>
                      <DataTable.Cell>
                        <Text style={{fontWeight: 'bold'}}>Pay now</Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        <Text style={{fontWeight: 'bold'}}>
                          {dryRun
                            ? dryRun.response
                              ? dryRun.response.chargeSummary.total.total
                                  .amount /
                                  100 +
                                ' ' +
                                currency_symbols[
                                  dryRun.response.chargeSummary.total.total
                                    .currency
                                ]
                              : null
                            : null}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  </DataTable>
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingTop: 20,
                      paddingRight: 20,
                      marginVertical: 10,
                    }}>
                    <Checkbox
                      status={checkedBox ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setCheckedBox(!checkedBox);
                      }}
                    />
                    <Text
                      style={{fontFamily: 'Raleway-Regular', color: '#000000'}}>
                      I accept the above changes to my server and order in
                      obligation.
                    </Text>
                  </View>
                </View>
              ) : (
                <Text
                  style={{
                    fontFamily: 'Raleway-Regular',
                    color: '#000000',
                    paddingBottom: 10,
                  }}>
                  Please select a new hardware profile above in order to see a
                  summary of changes.
                </Text>
              )
            ) : null}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            <TouchableOpacity onPress={changeProfile}>
              <GradientButton text="Change Profile" submitting={submitting} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
function SectionTitle({title, question, questionUrl}) {
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
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5,
      }}>
      <Text style={styles.titleText}>{title}</Text>
      <TouchableOpacity onPress={() => handleClick(questionUrl)}>
        <Text style={styles.infoUrl}>{question}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  card1: {
    margin: 3,
  },
  textheader: {
    color: '#111111',
    fontWeight: 'bold',
  },
  textcontent: {
    color: '#666666',
  },
  content: {
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  content1: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    padding: 0,
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Raleway-Medium',
    includeFontPadding: false,
    textAlign: 'left',
  },
  infoUrl: {
    color: '#00A1A1',
    fontFamily: 'Raleway-Regular',
    fontSize: 10,
    includeFontPadding: false,
  },
});
