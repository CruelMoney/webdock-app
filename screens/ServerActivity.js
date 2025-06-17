import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {ScrollView} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
import {Card, Title, useTheme} from 'react-native-paper';
import BottomSheetWrapper from '../components/BottomSheetWrapper';
export default function ServerActivity({route, navigation}) {
  const [metrics, setMetrics] = useState();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      //onBackgroundRefresh();
    });
    setTimeout(async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const data = await getMetrics(userToken, route.params.slug);
        setMetrics(data);
      } catch (e) {
        alert(e);
      }
    }, 0);
    return () => {
      unsubscribe(); // ✅ Proper cleanup of event listener
    };
  }, [route, navigation]);
  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp.replace(/ /g, 'T'));
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const formatTime = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp.replace(/ /g, 'T'));
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}`;
  };
  const theme = useTheme();
  const width = Dimensions.get('window').width * 0.9;

  return (
    <BottomSheetWrapper
      title="Server activity"
      onClose={() => navigation.goBack()}>
      {metrics ? (
        <View
          width="100%"
          height="100%"
          style={{
            width: '100%',
            height: '100%',
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}>
          {/* NETWORK CARD */}
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
                  {formatDate(metrics?.cpu?.usageSamplings?.at(-1)?.timestamp)}
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
                width={width}
                height={220}
                data={{
                  datasets: [
                    {
                      data: metrics?.cpu?.usageSamplings
                        ?.slice(-8)
                        ?.map(item => item.amount) ?? [0],
                      color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                    },
                    {
                      data: metrics?.network?.ingressSamplings
                        ?.slice(-8)
                        ?.map(item => item.amount + 10) ?? [0],
                      color: (opacity = 1) => `rgba(158, 158, 158, ${opacity})`,
                    },
                  ],
                  labels: metrics?.cpu?.usageSamplings
                    ?.slice(-8)
                    ?.map(item => formatTime(item.timestamp)) ?? [null],
                  legend: ['Network out (MiB)', 'Network in (MiB)'],
                }}
                yAxisInterval={1}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {borderRadius: 16},
                  propsForDots: {r: '6', strokeWidth: '2', stroke: 'white'},
                }}
                style={{borderRadius: 16}}
              />
            </Card.Content>
          </Card>

          {/* DISK CARD */}
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
                <Title
                  style={{
                    fontFamily: 'Raleway-Medium',
                    marginRight: 20,
                    color: '#bdbdbd',
                    includeFontPadding: false,
                  }}>
                  {formatDate(metrics?.disk?.samplings?.at(-1)?.timestamp)}
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
                width={width}
                height={220}
                data={{
                  datasets: [
                    {
                      data: metrics?.disk?.samplings
                        ?.slice(-8)
                        ?.map(item => item.amount) ?? [0],
                      color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                    },
                  ],
                  labels: metrics?.disk?.samplings
                    ?.slice(-8)
                    ?.map(item => formatTime(item.timestamp)) ?? [null],
                }}
                segments={5}
                yAxisInterval={1}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {borderRadius: 16},
                  fillShadowGradient: `rgba(0, 161, 161, 1)`,
                  fillShadowGradientOpacity: 1,
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: '#e3e3e3',
                    strokeDasharray: '0',
                  },
                }}
                style={{borderRadius: 16}}
                showBarTops
              />
            </Card.Content>
          </Card>

          {/* MEMORY CARD */}
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
                <Title
                  style={{
                    fontFamily: 'Raleway-Medium',
                    marginRight: 20,
                    color: '#bdbdbd',
                    includeFontPadding: false,
                  }}>
                  {formatDate(
                    metrics?.memory?.usageSamplings?.at(-1)?.timestamp,
                  )}
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
                width={width}
                height={220}
                data={{
                  datasets: [
                    {
                      data: metrics?.memory?.usageSamplings
                        ?.slice(-8)
                        ?.map(item => item.amount) ?? [0],
                      color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                    },
                  ],
                  labels: metrics?.memory?.usageSamplings
                    ?.slice(-8)
                    ?.map(item => formatTime(item.timestamp)) ?? [null],
                  legend: ['Memory use (MiB)'],
                }}
                yAxisInterval={4000}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {borderRadius: 16},
                  propsForDots: {r: '6', strokeWidth: '2', stroke: 'white'},
                }}
                style={{borderRadius: 16}}
                fromZero
              />
            </Card.Content>
          </Card>

          {/* CPU CARD */}
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
                <Title
                  style={{
                    fontFamily: 'Raleway-Medium',
                    marginRight: 20,
                    color: '#bdbdbd',
                    includeFontPadding: false,
                  }}>
                  {formatDate(
                    metrics?.network?.egressSamplings?.at(-1)?.timestamp,
                  )}
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
                width={width}
                height={220}
                data={{
                  datasets: [
                    {
                      data: metrics?.network?.egressSamplings
                        ?.slice(-8)
                        ?.map(item => item.amount) ?? [0],
                      color: (opacity = 1) => `rgba(0, 161, 161, ${opacity})`,
                    },
                    {
                      data: metrics?.processes?.processesSamplings
                        ?.slice(-8)
                        ?.map(item => item.amount + 10) ?? [0],
                      color: (opacity = 1) => `rgba(158, 158, 158, ${opacity})`,
                    },
                  ],
                  labels: metrics?.network?.ingressSamplings
                    ?.slice(-8)
                    ?.map(item => formatTime(item.timestamp)) ?? [null],
                  legend: ['CPU use (seconds)', 'Processes (count)'],
                }}
                yAxisInterval={1}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {borderRadius: 16},
                  propsForDots: {r: '6', strokeWidth: '2', stroke: 'white'},
                }}
                style={{borderRadius: 16}}
                fromZero
              />
            </Card.Content>
          </Card>

          <View style={{height: 10}} />
        </View>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.background,
            paddingHorizontal: 20,
            gap: 24,
          }}></View>
      )}
    </BottomSheetWrapper>
  );
}
