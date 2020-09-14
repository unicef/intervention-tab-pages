import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

// @lajos TO DO: check exactly where the values come from
// @lajos TO DO more: check with backend where the values are stored!!!!
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
}
