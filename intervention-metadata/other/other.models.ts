import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class OtherData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  planned_budget = new PlannedBudget();
}

export class OtherPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  document_currency = true;
}
