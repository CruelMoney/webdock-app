import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {getMetrics} from '../service/serverMetrics';
import {BarChart,LineChart} from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';
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
    }, 1000);
    return unsubscribe;
  }, [route]);
  return (
    <View width="100%" height="100%" style={{backgroundColor:'#F4F8F8',padding:'8%'}}>
    <View style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
      <TouchableOpacity onPress={navigation.goBack}><BackIcon height={45} width={50}/></TouchableOpacity>
      <Text style={{color:'#00A1A1',fontFamily:'Raleway-Medium',fontSize:20,textAlign:'center'}}>{route.params.name}</Text>
      <View style={{width:50}}></View>
    </View>
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
