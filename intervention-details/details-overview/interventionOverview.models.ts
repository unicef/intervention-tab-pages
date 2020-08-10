import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

// @lajos TO DO: values are populated
// @lajos TO DO: check with backend about cfei_number and humanitarian values, where they shuld come from

export class InterventionOverview extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  cfei_number = '';
  contingency_pd = false;
  humanitarian_flag = false;
}
