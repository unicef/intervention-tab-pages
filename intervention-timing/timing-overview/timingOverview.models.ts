import {Intervention} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class TimingOverviewData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  created = '';
}
