import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {ScrollView} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
import {Card, Title} from 'react-native-paper';
export default function ServerActivity({route, navigation}) {
  const [metrics, setMetrics] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //onBackgroundRefresh();
    });

    setTimeout(async () => {
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        getMetrics(userToken, route.params.slug).then(data => {
          setMetrics(data);
          console.log(data);
        });
      } catch (e) {
        alert(e);
      }
    }, 0);
    return unsubscribe;
  }, [route]);
  return (
    <View width="100%" height="100%" style={{backgroundColor: '#F4F8F8'}}>
      <View
        style={{
          padding: '8%',
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
          {route.params.name}
        </Text>
        <View style={{width: 50}}></View>
      </View>
      <ScrollView style={{marginHorizontal: '3%'}}>
        <Card
          mode="elevated"
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 10,
          }}>
          <Card.Title
            titleStyle={{fontFamily: 'Raleway-Regular', marginStart: 10}}
            title={'Network'}
            right={() => (
              <Title
                style={{
                  fontFamily: 'Raleway-Medium',
                  marginRight: 20,
                  color: '#bdbdbd',
                  includeFontPadding: false,
                }}>
                09-05-2023
              </Title>
            )}
          />
          <Card.Content
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LineChart
              width={Dimensions.get('window').width * 0.9}
              height={220}
              // verticalLabelRotation={125}
              data={{
                datasets: [
                  {
                    data: metrics
                      ? metrics.cpu.usageSamplings.slice(-8).map(item => {
                          return item.amount;
                        })
                      : [0],
                    color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                  },
                  {
                    data: metrics
                      ? metrics.network.ingressSamplings.slice(-8).map(item => {
                          return item.amount + 10;
                        })
                      : [0],
                    color: (opacity = 1) => `rgba(158, 158, 158, ${opacity})`,
                  },
                ],
                labels: metrics
                  ? metrics.cpu.usageSamplings.slice(-8).map(item => {
                      const dateString = item.timestamp.replace(/ /g, 'T');
                      var date = new Date(dateString);
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        '0',
                      );
                      return hours + ':' + minutes;
                    })
                  : [null],
                legend: ['Network out (MiB)', 'Network in (MiB)'],
              }}
              // height={400}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: 'white',
                },
              }}
              style={{
                borderRadius: 16,
              }}
              label
            />
          </Card.Content>
        </Card>
        <Card
          mode="elevated"
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: 10,
          }}>
          <Card.Title
            titleStyle={{fontFamily: 'Raleway-Regular', marginStart: 10}}
            title={'Disk'}
            right={() => (
              <Title style={{fontFamily: 'Raleway-Regular', marginRight: 20}}>
                09-05-2023
              </Title>
            )}
          />
          <Card.Content
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <BarChart
              width={Dimensions.get('window').width * 0.9}
              height={220}
              data={{
                datasets: [
                  {
                    data: metrics
                      ? metrics.disk.samplings.slice(-8).map(item => {
                          return item.amount;
                        })
                      : [0],
                    color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                  },
                ],
                labels: metrics
                  ? metrics.disk.samplings.slice(-8).map(item => {
                      const dateString = item.timestamp.replace(/ /g, 'T');
                      var date = new Date(dateString);
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        '0',
                      );
                      return hours + ':' + minutes;
                    })
                  : [null],
              }}
              segments={5}
              // height={400}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                fillShadowGradient: `rgba(0, 161, 161, 1)`,
                fillShadowGradientOpacity: 1,
                propsForBackgroundLines: {
                  strokeWidth: 1,
                  stroke: '#e3e3e3',
                  strokeDasharray: '0',
                },
              }}
              style={{
                borderRadius: 16,
              }}
              showBarTops
            />
          </Card.Content>
        </Card>
        <Card
          mode="elevated"
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: 10,
          }}>
          <Card.Title
            titleStyle={{fontFamily: 'Raleway-Regular', marginStart: 10}}
            title={'Memory'}
            right={() => (
              <Title style={{fontFamily: 'Raleway-Regular', marginRight: 20}}>
                09-05-2023
              </Title>
            )}
          />
          <Card.Content
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LineChart
              width={Dimensions.get('window').width * 0.9}
              height={220}
              data={{
                datasets: [
                  {
                    data: metrics
                      ? metrics.memory.usageSamplings.slice(-8).map(item => {
                          return item.amount;
                        })
                      : [0],
                    color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                  },
                ],
                labels: metrics
                  ? metrics.memory.usageSamplings.slice(-8).map(item => {
                      const dateString = item.timestamp.replace(/ /g, 'T');
                      var date = new Date(dateString);
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        '0',
                      );
                      return hours + ':' + minutes;
                    })
                  : [null],
                legend: ['Memory use (MiB)'],
              }}
              // height={400}
              yAxisInterval={4000}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: 'white',
                },
              }}
              style={{
                borderRadius: 16,
              }}
              label
              fromZero
            />
          </Card.Content>
        </Card>
        <Card
          mode="elevated"
          style={{
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: 10,
          }}>
          <Card.Title
            titleStyle={{fontFamily: 'Raleway-Regular', marginStart: 10}}
            title={'CPU'}
            right={() => (
              <Title style={{fontFamily: 'Raleway-Regular', marginRight: 20}}>
                09-05-2023
              </Title>
            )}
          />
          <Card.Content
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <LineChart
              width={Dimensions.get('window').width * 0.9}
              height={220}
              data={{
                datasets: [
                  {
                    data: metrics
                      ? metrics.network.egressSamplings.slice(-8).map(item => {
                          return item.amount;
                        })
                      : [0],
                    color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                  },
                  {
                    data: metrics
                      ? metrics.processes.processesSamplings
                          .slice(-8)
                          .map(item => {
                            return item.amount + 10;
                          })
                      : [0],
                    color: (opacity = 1) => `rgba(158, 158, 158, ${opacity})`,
                  },
                ],
                labels: metrics
                  ? metrics.network.ingressSamplings.slice(-8).map(item => {
                      const dateString = item.timestamp.replace(/ /g, 'T');
                      var date = new Date(dateString);
                      const hours = String(date.getHours()).padStart(2, '0');
                      const minutes = String(date.getMinutes()).padStart(
                        2,
                        '0',
                      );
                      return hours + ':' + minutes;
                    })
                  : [null],
                legend: ['CPU use (seconds)', 'Processes (count)'],
              }}
              // height={400}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: 'white',
                },
              }}
              style={{
                borderRadius: 16,
              }}
              label
              fromZero
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
