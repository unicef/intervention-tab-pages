import {LitElement} from 'lit';
import {Constructor} from '@unicef-polymer/etools-types';

export function PDOutputMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class PDOutputClass extends baseClass {};
}
