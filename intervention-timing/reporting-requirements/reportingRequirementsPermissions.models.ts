import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields} from '../../common/models/intervention.types';

export class ReportingRequirementsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  reporting_requirements = false;
}
