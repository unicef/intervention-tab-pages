let store: any;

export const setStore = (parentAppReduxStore: any) => {
  store = parentAppReduxStore;
};

export const getStore = () => store;
