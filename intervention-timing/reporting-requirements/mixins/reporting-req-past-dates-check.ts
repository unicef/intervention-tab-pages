import {LitElement, property} from 'lit-element';
import {Constructor} from '@unicef-polymer/etools-types';

declare const moment: any;
// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * Common reporting requirements past dates check used for UI
 * @polymer
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
      const now = moment().format('YYYY-MM-DD');
      const dueD = moment(new Date(dueDate)).format('YYYY-MM-DD');
      return moment(dueD).isBefore(now);
    }

    _canEdit(editMode: boolean) {
      return !editMode;
    }
  }
  return ReportingReqPastDatesCheckClass;
}

export default ReportingReqPastDatesCheckMixin;
