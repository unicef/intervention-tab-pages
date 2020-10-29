import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class PartnerInfo extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  partner_id: number | null = null;
  partner = '';
  partner_vendor = '';
  partner_focal_points: string[] = [];
  agreement: number | null = null;
}

export class PartnerInfoPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  partner_id = false;
  partner = false;
  partner_vendor = false;
  partner_focal_points = false;
  agreement = false;
}
