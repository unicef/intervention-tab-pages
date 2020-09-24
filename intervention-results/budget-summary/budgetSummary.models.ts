import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

export class BudgetSummary extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention.planned_budget);
    this.hq_support_cost = intervention.hq_support_cost!;
  }
  currency = '';
  hq_support_cost = '';
  programme_effectiveness = '';
  partner_contribution_local = '';
  unicef_cash_local = '';
  in_kind_amount_local = 0;
  partner_contribution_percent = 0;
  total_local = 0;
  total_cash = '';
  total_unicef_contribution_local = 0;
  total_cash_local = 0;
}
