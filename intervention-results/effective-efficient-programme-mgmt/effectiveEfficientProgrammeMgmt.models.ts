import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';
import {ModelsBase} from '../../common/models/models.base';

export class ProgrammeManagement extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  created = '';
  modified = '';
  act1_unicef = 0;
  act1_partner = 0;
  act2_unicef = 0;
  act2_partner = 0;
  act3_unicef = 0;
  act3_partner = 0;
  intervention = '';
  total_amount: number | null = null;
}

export class ProgrammeManagementActivityPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  act1_unicef = true;
  act1_partner = true;
  act2_unicef = false;
  act2_partner = false;
  act3_unicef = false;
  act3_partner = true;
}
