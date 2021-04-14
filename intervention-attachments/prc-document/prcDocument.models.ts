import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class PrcDocumentData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  prc_review_attachment: string | null = null;
  submitted_to_prc = false;
  status = '';
}

export class PrcDocumentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  prc_review_attachment = true;
}
