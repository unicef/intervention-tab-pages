import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class DocumentDetails extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  title = '';
  context = '';
  implementation_strategy = '';
  ip_program_contribution = '';
}

export class DocumentDetailsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  title = true;
  context = true;
  implementation_strategy = true;
  ip_program_contribution = true;
}
