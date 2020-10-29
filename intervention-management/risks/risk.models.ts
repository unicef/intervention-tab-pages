import {Intervention} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class Risk extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  id = '';
  risk_type = '';
  mitigation_measures = '';
}
