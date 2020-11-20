// @lajos TO DO: values are populated
// @lajos TO DO: check with backend about cfei_number and humanitarian values, where they shuld come from

import {Intervention} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class TimingOverviewData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  created = '';
  date_sent_to_partner = '';
  submission_date = '';
  submission_date_prc = '';
  review_date_prc = '';
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  // date last amended
  // @lajos: missing backend data for date last amended
}
