import {Constructor, LitElement} from 'lit-element';

export function PDOutputMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class PDOutputClass extends baseClass {};
}
