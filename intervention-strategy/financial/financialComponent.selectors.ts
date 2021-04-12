import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class FinancialComponentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  cash_transfer_modalities: string[] = [];
}

export class FinancialComponentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  cash_transfer_modalities = true;
}
