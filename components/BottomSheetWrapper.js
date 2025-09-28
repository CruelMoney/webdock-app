import React, {useRef, useEffect, useMemo} from 'react';
import {View, StyleSheet, Text, InteractionManager, Alert} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  ActivityIndicator,
  Icon,
  IconButton,
  useTheme,
} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Pressable} from 'react-native';
import {ErrorBoundary} from './ErrorBoundary';

export default function BottomSheetWrapper({
  children,
  onClose,
  snapPoints = ['93%'], // default height
  title = 'test',
}) {
  const bottomSheetRef = useRef(null);

  useEffect(() => {
    let attempts = 0;

    const trySnap = () => {
      if (bottomSheetRef.current) {
        try {
          bottomSheetRef.current.snapToIndex(0);
        } catch (e) {
          Alert.alert('test', e);
        }
      }

      // If it hasn't opened yet, try again
      if (attempts < 5) {
        attempts++;
        setTimeout(trySnap, 100); // Retry every 100ms
      }
    };

    const task = InteractionManager.runAfterInteractions(() => {
      trySnap(); // try after interactions & layout
    });

    return () => {
      task.cancel();
    };
  }, []);

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
        style={{backgroundColor: 'transparent'}}
        backgroundStyle={{backgroundColor: 'transparent'}}
        handleStyle={{
          backgroundColor: theme.colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 0,
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
        <BottomSheetScrollView
          contentContainerStyle={{
            marginBottom: insets.bottom,
            backgroundColor: theme.colors.background,
            flexGrow: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}
          style={{
            flex: 1,
            marginBottom: insets.bottom,
            flexDirection: 'column',
            padding: 0,
            margin: 0,
            gap: 0,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              backgroundColor: theme.colors.background,
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
          <View
            style={{
              flex: 1,
              paddingBottom: 20 + insets.bottom,
              minHeight: '100%',
            }}>
            <ErrorBoundary onError={onClose}>
              {children ? (
                children
              ) : (
                <View
                  style={{
                    height: 400,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </ErrorBoundary>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
