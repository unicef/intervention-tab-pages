import {Intervention, InterventionPermissionsFields, MinimalUser} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class ReviewData extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  agreement = '';
  prc_review_attachment: string | null = null;
  submission_date_prc = '';
  submission_date = '';
  submitted_to_prc = false;
  review_date_prc = '';
  frs_details = [];
  signed_pd_attachment: string | null = null;
  status = '';
  partner_authorized_officer_signatory: MinimalUser | null = null;
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  unicef_signatory: MinimalUser | null = null;
  days_from_submission_to_signed = '';
  days_from_review_to_signed = '';
  termination_doc_attachment = '';
}

export class ReviewDataPermission extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  partner_authorized_officer_signatory = true;
  signed_by_partner_date = true;
  signed_by_unicef_date = true;
  unicef_signatory = true;
  signed_pd_attachment = true;
}
