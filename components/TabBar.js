import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {React, useRef} from 'react';

export default function CustomTabBar({state, descriptors, navigation}) {
  const bottomSheetRef = useRef(null);

  const openBottomSheet = () => bottomSheetRef.current?.present();

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          if (route.name === 'PlusButton') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.plusButton}
                onPress={openBottomSheet}>
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>
            );
          }

          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}>
              <Text style={{color: isFocused ? '#673ab7' : '#222'}}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <BottomSheetModal ref={bottomSheetRef} index={0} snapPoints={['50%']}>
        <View style={{padding: 20}}>
          <Text>Bottom Sheet Content</Text>
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  plusButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#673ab7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  plusText: {
    fontSize: 32,
    color: '#fff',
  },
});
