import {createSelector} from 'reselect';
import {Intervention} from '../../common/models/intervention.types';
import {BudgetSummary} from './budgetSummary.models';
import {currentIntervention} from '../../common/selectors';

// @lajos TO DO: check exactly where the values come from

export const selectBudgetSummary = createSelector(currentIntervention, (intervention: Intervention) => {
  return new BudgetSummary(intervention);
});
