import {InterventionPermissionsFields, Intervention, PlannedVisit} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class PlannedVisits extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  planned_visits: PlannedVisit[] = [];
}

export class PlannedVisitsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  planned_visits = false;
}
