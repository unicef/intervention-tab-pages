import {Constructor, RootState} from '../models/globals.types';
import {getStoreAsync} from '../../utils/redux-store-access';
import {Store, Unsubscribe} from 'redux';

interface CustomElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  readonly isConnected: boolean;
}

export function connectStore<T extends Constructor<CustomElement>>(baseClass: T) {
  return class ConnectStoreMixin extends baseClass {
    private _storeUnsubscribe!: Unsubscribe;

    constructor(...args: any[]) {
      super(...args);
      getStoreAsync().then((store: Store<RootState>) => {
        this._storeUnsubscribe = store.subscribe(() => this.stateChanged(store.getState()));
        this.stateChanged(store.getState());
      });
    }
    disconnectedCallback() {
      if (this._storeUnsubscribe) {
        this._storeUnsubscribe();
      }
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

    stateChanged(_state: RootState) {}
  };
}
