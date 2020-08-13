import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';
import {AnyObject} from '../../common/models/globals.types';

export class Document extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  document_type = '';
  agreement = '';
  prc_review_attachment = '';
  submission_date_prc = '';
  submission_date = '';
  submitted_to_prc = false;
  review_date_prc = '';
  // @lajos bellow is a class
  frs_details: AnyObject[] = [];
  signed_pd_attachment = '';
  status = '';
  partner_authorized_officer_signatory = '';
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  unicef_signatory = '';
  days_from_submission_to_signed = '';
  days_from_review_to_signed = '';
}

export class DocumentPermission extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  submission_date = false;
  prc_review_attachment = false;
  submission_date_prc = false;
  review_date_prc = false;
  partner_authorized_officer_signatory = false;
  signed_by_partner_date = false;
  signed_by_unicef_date = false;
  unicef_signatory = false;
  signed_pd_attachment = false;
}
