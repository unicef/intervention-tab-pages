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
  capacity_development = '';
  other_partners_involved = '';
  data_processing_agreement = false;
  activities_involving_children = false;
  special_conditions_for_construction = false;
}

export class DocumentDetailsPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  title = true;
  context = true;
  implementation_strategy = true;
  capacity_development = true;
  other_partners_involved = true;
  data_processing_agreement = true;
  activities_involving_children = true;
  special_conditions_for_construction = true;
}
