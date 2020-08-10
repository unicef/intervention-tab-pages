import {ModelsBase} from '../../common/models/models.base';
import {PlannedBudget} from '../../common/models/intervention.types';

// @lajos TO DO: check exactly where the values come from
// @lajos TO DO more: check with backend where the values are stored!!!!
export class BudgetSummary extends ModelsBase {
  constructor(plannedBudget: PlannedBudget) {
    super();
    this.setObjProperties(plannedBudget);
  }
  // budget currency
  currency = '';
  // budget hq rate..not found....
  hq_rate = '';
  // prgm effectivenes...not found
  prgm_effectiveness = '';
  // total cso contribution... did not found CSO would this be
  partner_contribution_local = '';
  // total unicef contrib, assumed bellow
  unicef_cash_local = '';
  // total supply partner_contribution_local + unicef_cash_local
  // % partner contrib... calculated based on total supply?
  // total cash amt
  total_cash = '';
  // bellow will be updated when all data available
  total_amt = '';
}
