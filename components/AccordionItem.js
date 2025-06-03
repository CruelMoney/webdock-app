import React, {useState} from 'react';
import {StyleSheet, View, SafeAreaView, Text} from 'react-native';
import {Pressable} from 'react-native-gesture-handler';
import {Icon, useTheme} from 'react-native-paper';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  runOnUI,
} from 'react-native-reanimated';

export default function AccordionItem({
  title,
  children,
  topContent,
  bottomContent,
  viewKey,
  style,
  duration = 500,
}) {
  const [isMeasuring, setIsMeasuring] = useState(true);
  const contentHeight = useSharedValue(0);
  const isExpanded = useSharedValue(false);

  const progress = useDerivedValue(() =>
    withTiming(isExpanded.value ? 1 : 0, {duration}),
  );

  const animatedHeight = useAnimatedStyle(() => ({
    height: withTiming(isExpanded.value ? contentHeight.value : 0, {
      duration,
    }),
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: withTiming(isExpanded.value ? 0 : 4, {duration}),
    borderBottomRightRadius: withTiming(isExpanded.value ? 0 : 4, {duration}),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  const toggleAccordion = () => {
    isExpanded.value = !isExpanded.value;
  };

  const theme = useTheme();

  return (
    <SafeAreaView>
      <Pressable onPress={toggleAccordion}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: theme.colors.accent,
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 10,
              borderRadius: 4,
              alignItems: 'center',
            },
            borderStyle,
          ]}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Poppins-Medium',
              fontWeight: '500',
              fontSize: 16,
            }}>
            {title}
          </Text>
          <Animated.View style={iconStyle}>
            <Icon
              source="chevron-down"
              size={24}
              color={theme.colors.primary}
            />
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Top static content */}
      {topContent}

      {/* Collapsible content */}
      <Animated.View
        key={`accordionItem_${viewKey}`}
        style={[styles.animatedView, animatedHeight, style]}>
        <View style={{backgroundColor: theme.colors.surface}}>{children}</View>
      </Animated.View>

      {/* Bottom static content */}
      {bottomContent}

      {/* Hidden measurer for collapsible children */}
      {isMeasuring && (
        <View
          style={styles.measuringView}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            runOnUI(() => {
              contentHeight.value = h;
            })();
            setIsMeasuring(false);
          }}>
          <View>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  animatedView: {
    overflow: 'hidden',
  },
  measuringView: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    left: 0,
    right: 0,
  },
});
