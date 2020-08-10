import {PartnerStaffMember} from './partner.types';

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
