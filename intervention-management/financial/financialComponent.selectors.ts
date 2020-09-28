import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention, PlannedBudget} from '../../common/models/intervention.types';

export class FinancialComponentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  cash_transfer_modalities: string[] = [];
  hq_support_cost = '';
  planned_budget = new PlannedBudget();
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
