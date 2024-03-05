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
  other_details = '';
  has_data_processing_agreement = false;
  has_activities_involving_children = false;
  has_special_conditions_for_construction = false;
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
  other_details = true;
  has_data_processing_agreement = true;
  has_activities_involving_children = true;
  has_special_conditions_for_construction = true;
}
