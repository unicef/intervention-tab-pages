import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';

export class FinancialComponentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
    this.currency = intervention.planned_budget.currency!;
  }
  cash_tranfer_modalities = '';
  hq_support_cost = '';
  currency = '';
  in_amendment = false;
  id = 0;
}

export class FinancialComponentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  cash_transfer_modalities = true;
  hq_support_cost = true;
  planned_budget = true;
}
