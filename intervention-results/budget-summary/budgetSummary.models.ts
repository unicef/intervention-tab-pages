import {ModelsBase} from '../../common/models/models.base';
import {Intervention} from '../../common/models/intervention.types';

// @lajos TO DO: check exactly where the values come from
// @lajos TO DO more: check with backend where the values are stored!!!!
export class BudgetSummary extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention.planned_budget);
    this.hq_support_cost = intervention.hq_support_cost!;
    this.prgm_effectiveness = intervention.prgm_effectiveness!;
  }
  // budget currency
  currency = '';
  // total cso contribution... did not found CSO would this be
  partner_contribution_local = '';
  // Budget HQ Rate
  hq_support_cost = '';
  // total unicef contrib, assumed bellow
  unicef_cash_local = '';
  // total supply will
  in_kind_amout_local = '';

  // @lajos: partner percentage will come from backend
  partner_percentage = '';
  // total cash amt
  total_cash = '';
  // bellow will be updated when all data available
  // possibly in kind total amount is not Total Amt (Cash + Supply)
  in_kind_amount = '';
  prgm_effectiveness = '';
  // still missing data for:
  /* % Prgm Effectiveness
  % Partner Contrib
  Total Cash Amt
  Total Amt (Cash + Supply) */
}
