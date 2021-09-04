import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
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
      <Text>Memory Usage</Text>
      {/* <LineChart
        // data={{
        //   labels: metrics
        //     ? metrics.memory
        //       ? metrics.memory.usageSamplings.map(a => a.timestamp)
        //       : []
        //     : [],
        //   datasets: [
        //     {
        //       data:
        //         [] + metrics
        //           ? metrics.memory
        //             ? metrics.memory.usageSamplings.map(a => a.amount)
        //             : []
        //           : [],
        //     },
        //   ],
        // }}
        width={Dimensions.get('window').width} // from react-native
        height={220}
        yAxisLabel="$"
        chartConfig={{
          backgroundGradientFrom: '#1E2923',
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: '#08130D',
          backgroundGradientToOpacity: 0.5,
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          strokeWidth: 2, // optional, default 3
          barPercentage: 0.5,
          useShadowColorFromDataset: false, // optional
        }}
        yAxisSuffix="k"
        yAxisInterval={1} // optional, defaults to 1
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      /> */}
    </View>
  );
}
