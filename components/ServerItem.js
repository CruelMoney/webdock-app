import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import Spacer from './Spacer';
import {useTheme} from 'react-native-paper';
import ArrowIcon from '../assets/arrow-icon.svg';
import {getServerIcon} from '../service/servers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import {serverIconResponseCache} from '../service/serverIconCache';

function ServerItem({title, alias, dc, profile, ipv4, status, slug}) {
  const theme = useTheme();
  function fixUrl(url) {
    let unescaped = url.replace(/\\\//g, '/');
    if (unescaped.startsWith('//')) {
      return 'https:' + unescaped;
    }
    if (unescaped.startsWith('http://') || unescaped.startsWith('https://')) {
      return unescaped;
    }
    return unescaped;
  }
  // Initialize icon state from cache if available
  const [icon, setIcon] = useState(() =>
    serverIconResponseCache[slug]
      ? fixUrl(serverIconResponseCache[slug].icon)
      : undefined,
  );

  const renderStatusIcon = icon => {
    const color =
      icon === 'stopped'
        ? '#E15241'
        : [
            'running',
            'waiting',
            'working',
            'provisioning',
            'rebooting',
            'starting',
            'stopping',
            'reinstalling',
          ].includes(icon)
        ? '#4C9F5A'
        : theme.colors.text;

    return (
      <Text
        style={{
          fontFamily: 'Poppins-Light',
          fontSize: 14,
          includeFontPadding: false,
          color,
        }}>
        {icon.charAt(0).toUpperCase() + icon.slice(1)}
      </Text>
    );
  };

  useEffect(() => {
    let mounted = true;

    async function loadIcon() {
      if (serverIconResponseCache[slug]) {
        const cachedIcon = fixUrl(serverIconResponseCache[slug].icon);
        if (mounted && cachedIcon !== icon) {
          FastImage.preload([{uri: cachedIcon}]);
          setIcon(cachedIcon);
        }
        return;
      }

      try {
        const response = await getServerIcon(slug);
        serverIconResponseCache[slug] = response;

        const fixed = fixUrl(response.icon);
        if (mounted && fixed !== icon) {
          FastImage.preload([{uri: fixed}]);
          setIcon(fixed);
        }
      } catch (error) {
        console.error('Failed to fetch icon for slug:', slug, error);
      }
    }

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <View style={{backgroundColor: theme.colors.surface}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
        }}>
        {/* Icon */}
        <FastImage
          source={{
            uri: icon,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={{borderRadius: 4, width: 42, height: 42, marginRight: 12}}
        />

        {/* Text Content */}
        <View
          style={{
            flex: 1, // Take up remaining space
            minWidth: 0, // Important to allow text truncation
          }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: 'Poppins-Medium',
              fontSize: 16,
              fontWeight: '500',
              color: theme.colors.text,
            }}>
            {title}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              fontFamily: 'Poppins-Light',
              fontSize: 12,
              fontWeight: '300',
              color: '#8F8F8F',
            }}>
            {renderStatusIcon(status)} · {ipv4}
          </Text>
        </View>

        {/* Arrow Icon */}
        <View style={{marginLeft: 12}}>
          <ArrowIcon width={15} height={15} color={theme.colors.primaryText} />
        </View>
      </View>
    </View>
  );
}

export default React.memo(ServerItem);
