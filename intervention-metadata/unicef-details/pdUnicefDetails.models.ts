import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';
import {AnyObject} from '@unicef-polymer/etools-types';

export class PdUnicefDetails extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  offices: AnyObject[] = [];
  sections: AnyObject[] = [];
  unicef_focal_points: AnyObject[] = [];
  budget_owner: AnyObject = {};
  country_programmes: [] = [];
}

export class PdUnicefDetailsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  offices = true;
  sections = true;
  unicef_focal_points = true;
  budget_owner = true;
  country_programmes = true;
}
