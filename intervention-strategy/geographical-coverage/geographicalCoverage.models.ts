import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class LocationsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  flat_locations = true;
  sites = false;
}
