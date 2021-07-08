import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class HqContributionData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  hq_support_cost = '';
  planned_budget = new PlannedBudget();
}

export class HqContributionPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  hq_support_cost = true;
  planned_budget = true;
}
