import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';
import {AnyObject} from '../../common/models/globals.types';

export class PdUnicefDetails extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  offices: AnyObject[] = [];
  sections: AnyObject[] = [];
  cluster_names: AnyObject[] = [];
  unicef_focal_points: AnyObject[] = [];
  budget_owner: AnyObject[] = [];
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
