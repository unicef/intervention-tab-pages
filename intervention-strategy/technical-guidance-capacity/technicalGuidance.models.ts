import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class TechnicalDetails extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  technical_guidance = '';
  capacity_development = '';
  other_partners_involved = '';
  other_info = '';
}

export class TechnicalDetailsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  technical_guidance = true;
  capacity_development = true;
  other_partners_involved = true;
  other_info = true;
}
