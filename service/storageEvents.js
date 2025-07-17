import AsyncStorage from '@react-native-async-storage/async-storage';
import eventBus from '../util/eventBus';

export const setGlobalCallbackId = async id => {
  await AsyncStorage.setItem('callbackId', id);
  eventBus.emit('callbackIdChanged', id);
};

export const removeGlobalCallbackId = async () => {
  await AsyncStorage.removeItem('callbackId');
  eventBus.emit('callbackIdChanged', null);
};

export const onCallbackIdChanged = listener => {
  eventBus.on('callbackIdChanged', listener);
  return () => eventBus.removeListener('callbackIdChanged', listener);
};
export const emitBellTrigger = () => {
  eventBus.emit('bellRing');
};

export const onBellRing = listener => {
  eventBus.on('bellRing', listener);
  return () => eventBus.removeListener('bellRing', listener);
};
