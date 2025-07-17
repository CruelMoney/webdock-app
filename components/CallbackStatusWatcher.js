import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ProgressBar, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getEventsByCallbackId} from '../service/events';
import {
  emitBellTrigger,
  removeGlobalCallbackId,
} from '../service/storageEvents';
import eventBus from '../util/eventBus';

export default function CallbackStatusWatcher({onFinished}) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const prevActive = useRef(false);
  const pollingInterval = useRef(null);
  const pollingTimeout = useRef(null);
  const [callbackId, setCallbackId] = useState(null);

  // Load callbackId from AsyncStorage and listen for changes
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem('callbackId').then(id => {
      if (isMounted && id) setCallbackId(id);
    });
    const handler = id => {
      if (isMounted) setCallbackId(id);
    };
    eventBus.on('callbackIdChanged', handler);
    return () => {
      isMounted = false;
      eventBus.off('callbackIdChanged', handler);
    };
  }, []);

  useEffect(() => {
    if (!callbackId) return;

    const poll = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const events = await getEventsByCallbackId(userToken, callbackId);
        const hasActive = events.some(
          e => e.status === 'working' || e.status === 'waiting',
        );
        console.log('poll happening');
        if (hasActive) {
          setLoading(true);
          prevActive.current = true;
        } else {
          setLoading(false);

          if (prevActive.current) {
            prevActive.current = false;

            // Optional: notify parent
            onFinished?.();
            emitBellTrigger();

            // Cleanup
            clearInterval(pollingInterval.current);
            clearTimeout(pollingTimeout.current);
            await removeGlobalCallbackId();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollingInterval.current = setInterval(poll, 5000);
    pollingTimeout.current = setTimeout(async () => {
      console.warn('Callback polling timed out');
      clearInterval(pollingInterval.current);
      clearTimeout(pollingTimeout.current);
      await removeGlobalCallbackId();
      setLoading(false);
    }, 60000);

    return () => {
      clearInterval(pollingInterval.current);
      clearTimeout(pollingTimeout.current);
    };
  }, [callbackId]);

  return (
    <>
      {loading && (
        <ProgressBar
          indeterminate
          color={theme.colors.primary}
          style={{height: 4}}
        />
      )}
    </>
  );
}
