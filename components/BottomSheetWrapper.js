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
import {ErrorBoundary} from './ErrorBoundary';

export default function BottomSheetWrapper({
  children,
  onClose,
  snapPoints = ['93%'], // default height
  title = 'test',
}) {
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (children) {
      requestAnimationFrame(() => {
        bottomSheetRef.current?.snapToIndex(0);
      });
    }
  }, [children]);

  const handleChange = index => {
    if (index === -1 && onClose) {
      onClose();
    }
  };

  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
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
        <BottomSheetView
          style={{flex: 1, flexDirection: 'column', padding: 0, margin: 0}}>
          <View
            style={{
              width: '100%',
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
          <View style={{flex: 1}}>
            <ErrorBoundary onError={onClose}>{children}</ErrorBoundary>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
