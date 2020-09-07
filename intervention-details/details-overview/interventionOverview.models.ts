import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

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
