import {AnyObject} from '../common/models/globals.types';

export const fireEvent = (el: HTMLElement, eventName: string, eventDetail?: AnyObject) => {
  el.dispatchEvent(
    new CustomEvent(eventName, {
      detail: eventDetail,
      bubbles: true,
      composed: true
    })
  );
};
