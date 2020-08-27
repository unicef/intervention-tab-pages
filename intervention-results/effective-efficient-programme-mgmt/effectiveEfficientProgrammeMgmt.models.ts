import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';
import {ModelsBase} from '../../common/models/models.base';

export class ProgrammeManagement extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  created = '';
  modified = '';
  act1_unicef = 1;
  act1_partner = 2;
  act2_unicef = 3;
  act2_partner = 4;
  act3_unicef = 5;
  act3_partner = 6;
  intervention = '';
  total_amount: number | null = null;
}

export class ProgrammeManagementActivityPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  programme_management_activity = true;
}
