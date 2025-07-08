import AsyncStorage from '@react-native-async-storage/async-storage';
import EventEmitter from 'events';

const storageEmitter = new EventEmitter();

export const setGlobalCallbackId = async id => {
  await AsyncStorage.setItem('callbackId', id);
  storageEmitter.emit('callbackIdChanged', id);
};

export const removeGlobalCallbackId = async () => {
  await AsyncStorage.removeItem('callbackId');
  storageEmitter.emit('callbackIdChanged', null);
};

export const onCallbackIdChanged = listener => {
  storageEmitter.on('callbackIdChanged', listener);
  return () => storageEmitter.removeListener('callbackIdChanged', listener);
};
export const emitBellTrigger = () => {
  storageEmitter.emit('bellRing');
};

export const onBellRing = listener => {
  storageEmitter.on('bellRing', listener);
  return () => storageEmitter.removeListener('bellRing', listener);
};
