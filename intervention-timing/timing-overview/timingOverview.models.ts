import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

// @lajos TO DO: values are populated
// @lajos TO DO: check with backend about cfei_number and humanitarian values, where they shuld come from

export class TimingOverviewData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  // assumed date created
  created = '';
  // date first sent to partner?
  date_sent_to_partner = '';
  // @lajos: NOT FOUND date first draft by partnerr
  // date_draft_partner?
  // prc submission date
  submission_date_prc = '';
  // PRC review date
  review_date_prc = '';
  // date signed by partner
  signed_by_partner_date = '';
  // date UNICEF signed
  signed_by_unicef_date = '';
  // date last amended
  // @lajos: NOT FOUND -> date_amended?
}
