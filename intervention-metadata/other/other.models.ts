import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class OtherData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  planned_budget = new PlannedBudget();
  document_type = '';
  humanitarian_flag = false;
  contingency_pd = false;
  activation_protocol = '';
  confidential = false;
}

export class OtherPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  document_type = true;
  document_currency = true;
  confidential = true;
}
