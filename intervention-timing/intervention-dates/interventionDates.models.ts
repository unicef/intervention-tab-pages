import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';

export class ProgrammeDocDates extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  start = '';
  end = '';
  contingency_pd = false;
  activation_letter_attachment = '';
  status = ''; // intervention status
}

export class InterventionDatesPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  start = false;
  end = false;
  activation_letter_attachment = false;
}
