import {LitElement} from 'lit-element';
import {PolymerElement} from '@polymer/polymer';
import {AnyObject} from '../common/models/globals.types';

type ValidatableElement = (LitElement | PolymerElement) & {validate(): boolean};

export const validateRequiredFields = (element: LitElement | PolymerElement) => {
  let isValid = true;
  element!.shadowRoot!.querySelectorAll<ValidatableElement>('[required]').forEach((el) => {
    if (el && el.validate && !el.validate()) {
      isValid = false;
    }
  });
  return isValid;
};

export const resetRequiredFields = (element: LitElement | PolymerElement) => {
  element!.shadowRoot!.querySelectorAll<ValidatableElement>('[required]').forEach((el: AnyObject) => {
    if (el) {
      el.invalid = false;
    }
  });
};
