import {createSelector} from 'reselect';
import {PlannedBudget} from '../../common/models/intervention.types';
import {BudgetSummary} from './budgetSummary.models';
import {currentInterventionPlannedBudget} from '../../common/selectors';

// @lajos TO DO: check exactly where the values come from

export const selectBudgetSummary = createSelector(currentInterventionPlannedBudget, (plannedBudget: PlannedBudget) => {
  return new BudgetSummary(plannedBudget);
});
