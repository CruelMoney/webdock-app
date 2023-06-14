import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {ScrollView} from 'react-native-gesture-handler';
import BackIcon from '../assets/back-icon.svg';
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
      <ScrollView>
        <LineChart
          height={250}
          verticalLabelRotation={125}
          data={{
            datasets: [
              {
                data: metrics
                  ? metrics.memory.usageSamplings.slice(-5).map(item => {
                      return item.amount;
                    })
                  : [0],
              },
              {
                data: metrics
                  ? metrics.memory.usageSamplings.slice(-5).map(item => {
                      return item.amount + 10;
                    })
                  : [0],
                strokeWidth: 2,
              },
            ],
            labels: metrics
              ? metrics.memory.usageSamplings.slice(-5).map(item => {
                  return item.timestamp;
                })
              : [null],
            legend: ['Memory In', 'Memory Out'],
          }}
          width={Dimensions.get('window').width - 20}
          // height={400}
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={{
            backgroundColor: '#97bbcd',
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
              stroke: '#97bbcd',
            },
          }}
          bezier
          style={{
            borderRadius: 16,
            marginBottom: 25,
            marginTop: 25,
          }}
        />
      </ScrollView>
    </View>
  );
}
