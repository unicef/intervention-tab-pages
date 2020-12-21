import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class FinancialComponentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  cash_transfer_modalities: string[] = [];
  hq_support_cost = '';
  total_hq_cash_local = '';
  total_unicef_cash_local_wo_hq = '';
  planned_budget = new PlannedBudget();
}

export class FinancialComponentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  cash_transfer_modalities = true;
  hq_support_cost = true;
  total_hq_cash_local = true;
  total_unicef_cash_local_wo_hq = true;
  planned_budget = true;
}
