import {RootState} from '../common/types/store.types';
import {Store} from 'redux';

let store: Store<RootState>;
let storePromise: Promise<Store<RootState>> | null = null;
let storeResolver: ((store: Store<RootState>) => void) | null = null;

export const setStore = (parentAppReduxStore: Store<RootState>) => {
  store = parentAppReduxStore;
  if (storeResolver) {
    storeResolver(store);
    storePromise = null;
    storeResolver = null;
  }
};

export const getStore = () => {
  return store;
};

export const getStoreAsync = () => {
  if (store) {
    return Promise.resolve(store);
  }
  if (!storePromise) {
    storePromise = new Promise((resolve) => (storeResolver = resolve));
  }
  return storePromise;
};
