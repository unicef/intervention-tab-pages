export class PartnerStaffMember {
  id: number | null = null;
  name?: string;
  first_name = '';
  last_name = '';
  active = true;
  title = '';
  email = '';
  phone = '';
}

export type StaticPartner = {
  street_address: string;
  last_assessment_date: string | null;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  id: number;
  vendor_number: string;
  deleted_flag: boolean;
  blocked: boolean;
  name: string;
  short_name: string;
  partner_type: string;
  cso_type: string | null;
  rating: string;
  shared_with: string | null;
  email: string;
  phone_number: string;
  total_ct_cp: null;
  total_ct_cy: null;
  net_ct_cy: null;
  reported_cy: null;
  total_ct_ytd: null;
  hidden: boolean;
  basis_for_risk_rating: string;
  psea_assessment_date: null;
  sea_risk_rating_name: string;
};
