import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart,LineChart} from 'react-native-mp-android-chart';
import { ScrollView } from 'react-native-gesture-handler';
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
    }, 1000);
    return unsubscribe;
  }, [navigation]);
  return (
    <View>
      <ScrollView>
      <Text>Memory Usage</Text>
      <LineChart
    data={{
      datasets: [
        {
          yValues: metrics?metrics.memory.usageSamplings.map((item) => {return item.amount}):
          [
            0
          ],
          label: 'Data set 1',
          config: {
            color:'teal'
          }
        }
      ],
      xValues: metrics?metrics.memory.usageSamplings.map((item) => {return item.timestamp}):[null],
    }}
    animation={{durationX: 2000}}
    chart={{
      height: 300,
      width: 300
    }}
  />
  </ScrollView>
    </View>
  );
}
