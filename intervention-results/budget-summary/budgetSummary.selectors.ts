import {createSelector} from 'reselect';
import {BudgetSummary} from './budgetSummary.models';
import {currentIntervention} from '../../common/selectors';
import {Intervention} from '@unicef-polymer/etools-types';

// @lajos TO DO: check exactly where the values come from

export const selectBudgetSummary = createSelector(currentIntervention, (intervention: Intervention) => {
  return new BudgetSummary(intervention);
});
