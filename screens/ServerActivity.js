import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart,LineChart} from 'react-native-chart-kit';
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
  }, [route]);
  return (
    <View>
      <ScrollView>
      <Text>Memory Usage</Text>
      <LineChart
    data={{
      datasets: [
        {
          data: metrics?metrics.memory.usageSamplings.map((item) => {return item.amount}):
          [
            0
          ]
        }
      ],
      labels: metrics?metrics.memory.usageSamplings.map((item) => {return item.timestamp}):[null],
    }}
    width={Dimensions.get("window").width} // from react-native
    height={220}
    yAxisInterval={1} // optional, defaults to 1
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 0, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
  </ScrollView>
    </View>
  );
}
