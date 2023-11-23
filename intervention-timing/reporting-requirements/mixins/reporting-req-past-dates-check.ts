import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {Constructor} from '@unicef-polymer/etools-types';

declare const dayjs: any;

/**
 * Common reporting requirements past dates check used for UI
 * @LitElement
 * @mixinFunction
 */
function ReportingReqPastDatesCheckMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ReportingReqPastDatesCheckClass extends baseClass {
    @property({type: Boolean})
    editMode = false;

    _getUneditableStyles() {
      return 'color: var(--secondary-text-color)';
    }

    _pastDueDate(dueDate: string) {
      const now = dayjs().format('YYYY-MM-DD');
      const dueD = dayjs(new Date(dueDate)).format('YYYY-MM-DD');
      return dayjs(dueD).isBefore(now);
    }

    _canEdit(editMode: boolean) {
      return !editMode;
    }
  }
  return ReportingReqPastDatesCheckClass;
}

export default ReportingReqPastDatesCheckMixin;
