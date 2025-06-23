import React, {
  useState,
  useEffect,
  PureComponent,
  useRef,
  useCallback,
} from 'react';
import {Image, Text, View} from 'react-native';
import Spacer from './Spacer';
import {Button, useTheme} from 'react-native-paper';
const NewsItem = ({
  item: {
    title,
    markdownContent,
    featuredImage,
    date,
    locale,
    isPublished,
    type,
    changelogCategories,
    slug,
  },
  onPress,
}) => {
  const theme = useTheme();
  function formatDate(isoDateStr) {
    const date = new Date(isoDateStr);

    // Array of month names
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getUTCDate(); // Use getUTCDate to avoid timezone shifts
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();

    // Function to add suffix to day
    function getDaySuffix(day) {
      if (day >= 11 && day <= 13) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    }

    return `${month} ${day}${getDaySuffix(day)}, ${year}`;
  }

  return (
    <View
      key={slug}
      style={{
        backgroundColor: theme.colors.background,
        paddingHorizontal: 11,
        paddingVertical: 10,
        borderRadius: 4,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}>
        {changelogCategories.map(item => {
          return (
            <View
              key={item.name}
              style={{
                backgroundColor: item.color.toLowerCase(),
                paddingVertical: 3,
                paddingHorizontal: 4,
                borderRadius: 2,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontWeight: '700',
                  fontSize: 8,
                  color: 'white',
                }}>
                {item.name}
              </Text>
            </View>
          );
        })}
        <Spacer size={12} horizontal />
        <Text style={{color: theme.colors.text}}>{formatDate(date)}</Text>
      </View>
      <Spacer size={12} />
      <Text
        style={{
          width: '100%',
          fontFamily: 'Poppins-SemiBold',
          fontWeight: '600',
          fontSize: 14,
          lineHeight: 14,
          color: theme.colors.text,
        }}>
        {title}
      </Text>
      <Spacer size={12} />
      <Image
        resizeMode="contain"
        objectFit="cover"
        source={{
          uri: featuredImage,
        }}
        style={{borderRadius: 4, width: '100%', height: 168}}
      />
      <Spacer size={12} />

      <Text style={{color: theme.colors.text}}>{markdownContent}</Text>
      <Button
        mode="contained"
        textColor="black"
        compact
        style={{
          borderRadius: 4,
          minWidth: 0,
          paddingHorizontal: 8,
        }}
        labelStyle={{
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          lineHeight: 12 * 1.2,
          fontWeight: '600',
        }}
        onPress={onPress}>
        Read more
      </Button>
    </View>
  );
};
export default NewsItem;
