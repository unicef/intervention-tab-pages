import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';

export class FinancialComponentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  cash_tranfer_modalities = '';
  hq_support_cost = '';
}

export class FinancialComponentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  cash_transfer_modalities = true;
  hq_support_cost = true;
}
