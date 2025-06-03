import React, {useRef, useEffect, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Icon, IconButton, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Pressable} from 'react-native-gesture-handler';

export default function BottomSheetWrapper({
  children,
  onClose,
  snapPoints = ['93%'], // default height
  title = 'test',
}) {
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(0);
    });
  }, []);

  const handleChange = index => {
    if (index === -1 && onClose) {
      onClose();
    }
  };

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleChange}
        handleComponent={() => null}
        handleStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.text,
        }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}>
        <BottomSheetView contentContainerStyle={[styles.sheetContent]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}>
            <IconButton
              icon="close"
              size={30}
              color={theme.colors.text}
              onPress={onClose}
              style={{
                padding: 0,
                margin: 0,
              }}
            />
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 22,
                textAlign: 'center',
                color: theme.colors.text,
              }}>
              {title}
            </Text>
            <View style={{width: 30, height: 30}}></View>
          </View>
          {children}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContent: {},
});
