import {PartnerStaffMember} from './partner.types';
import {Permission} from './globals.types';

export class MinimalAgreement {
  id: number | null = null;
  agreement_number = '';
  agreement_number_status = '';
  agreement_type = '';
  authorized_officers: PartnerStaffMember[] = [];
  country_programme: number | null = null;
  end = ''; // end date
  start = '';
  partner: number | null = null;
  partner_name = '';
  signed_by_partner_date = '';
  signed_by_unicef_date = '';
  special_conditions_pca = false;
  status = '';
}

class AgreementPermissionFields {
  constructor(forEdit: boolean) {
    if (forEdit) {
      this._setEditPermissionsForNewAgreement();
    } else {
      this._setRequiredPermissionsForNewAgreement();
    }
  }

  agreement_type = true;
  amendments = false;
  attachment = true;
  authorized_officers = true;
  country_programme = true;
  end = true;
  partner = true;
  partner_manager = true;
  signed_by_id = true;
  signed_by_partner_date = true;
  signed_by_unicef_date = true;
  start = true;
  special_conditions_pca = true;

  _setEditPermissionsForNewAgreement() {
    this.agreement_type = true;
    this.amendments = false;
    this.attachment = true;
    this.authorized_officers = true;
    this.country_programme = true;
    this.end = true;
    this.partner = true;
    this.partner_manager = true;
    this.signed_by_id = true;
    this.signed_by_partner_date = true;
    this.signed_by_unicef_date = true;
    this.start = true;
    this.special_conditions_pca = true;
  }

  _setRequiredPermissionsForNewAgreement() {
    this.agreement_type = true;
    this.amendments = false;
    this.attachment = false;
    this.authorized_officers = false;
    this.country_programme = true;
    this.end = false;
    this.partner = true;
    this.signed_by_id = false;
    this.partner_manager = false;
    this.signed_by_partner_date = false;
    this.signed_by_unicef_date = false;
    this.start = false;
    this.special_conditions_pca = false;
  }
}

export class Agreement extends MinimalAgreement {
  authorized_officers: PartnerStaffMember[] = [];
  amendments?: AgreementAmendment[] = [];
  reference_number_year?: number = new Date().getFullYear();
  partner_manager?: number | null = null;
  permissions?: Permission<AgreementPermissionFields> = {
    edit: new AgreementPermissionFields(true),
    required: new AgreementPermissionFields(false)
  };
  attachment?: string;

  [key: string]: any;
}

export class AgreementAmendment {
  id: number | null = null;
  signed_date: string | null = null;
  types: string[] = [];
  signed_amendment_attachment: number | string | null = null;
}
