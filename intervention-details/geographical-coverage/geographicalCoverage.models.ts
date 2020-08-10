import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields} from '../../common/models/intervention.types';

export class LocationsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  flat_locations = true;
}
