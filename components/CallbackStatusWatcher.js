import React, {useEffect, useRef, useState} from 'react';
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
  const [callbackId, setCallbackId] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const seenActiveRef = useRef(false);
  const finalizedRef = useRef(false);

  // initial load + subscribe to changes
  useEffect(() => {
    mountedRef.current = true;

    (async () => {
      const id = await AsyncStorage.getItem('callbackId');
      if (mountedRef.current && id) setCallbackId(id);
    })();

    const handler = id => {
      if (!mountedRef.current) return;
      setCallbackId(id);
    };
    eventBus.on('callbackIdChanged', handler);

    return () => {
      mountedRef.current = false;
      eventBus.off('callbackIdChanged', handler);
    };
  }, []);

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const finalize = async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;

    clearTimers();
    setLoading(false);

    try {
      onFinished?.();
      emitBellTrigger();
    } catch (e) {
      console.warn('onFinished/emitBellTrigger error', e);
    }

    try {
      await removeGlobalCallbackId();
    } catch (e) {
      console.warn('removeGlobalCallbackId error', e);
    } finally {
      setCallbackId(null);
      seenActiveRef.current = false;
    }
  };

  useEffect(() => {
    clearTimers();
    finalizedRef.current = false;
    seenActiveRef.current = false;

    if (!callbackId) {
      setLoading(false);
      return;
    }

    // show immediately when we have a callbackId (covers fast jobs)
    setLoading(true);

    const poll = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        const events = await getEventsByCallbackId(userToken, callbackId);

        // normalize and check only the allowed statuses
        const statuses = (events ?? []).map(e =>
          String(e?.status || '').toLowerCase(),
        );

        const hasActive = statuses.some(
          s => s === 'waiting' || s === 'working',
        );
        const hasTerminal = statuses.some(
          s => s === 'finished' || s === 'error',
        );

        if (hasActive) {
          seenActiveRef.current = true;
          setLoading(true);
          return;
        }

        // hide when any terminal status appears
        if (hasTerminal) {
          await finalize();
          return;
        }

        // if we previously saw active and now there is no active,
        // treat as done (covers brief gaps before "finished" propagates)
        if (seenActiveRef.current && !hasActive) {
          await finalize();
          return;
        }

        // otherwise, keep showing (job may not have started yet)
        setLoading(true);
      } catch (err) {
        // transient error: keep current UI; next poll will fix it
        console.error('Polling error:', err);
      }
    };

    // kick off and then poll every 5s (keep your original cadence)
    poll();
    intervalRef.current = setInterval(poll, 5000);

    // hard stop at 60s (your original), then clean up
    timeoutRef.current = setTimeout(async () => {
      console.warn('Callback polling timed out');
      await finalize();
    }, 60000);

    return clearTimers;
  }, [callbackId]);

  return loading ? (
    <ProgressBar
      indeterminate
      color={theme.colors.primary}
      style={{height: 4}}
    />
  ) : null;
}
