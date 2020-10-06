import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

// @lajos TO DO: values are populated
// @lajos TO DO: check with backend about cfei_number and humanitarian values, where they shuld come from

export class TimingOverviewData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  created = '';
  date_sent_to_partner = '';
  date_draft_by_partner = '';
  submission_date_prc = '';
  review_date_prc = '';
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  // date last amended
  // @lajos: missing backend data for date last amended
}
