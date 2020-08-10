import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';
import {ModelsBase} from '../../common/models/models.base';

export class PartnerDetails extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  partner_id: number | null = null;
  partner = '';
  partner_vendor = '';
  partner_focal_points: number[] = [];
  agreement: number | null = null;
}

export class PartnerDetailsPermissions extends ModelsBase {
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
