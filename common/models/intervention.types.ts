export interface ExpectedResult {
  id: number;
  cp_output: number;
  cp_output_name: string;
  intervention: number;
  ll_results: ResultLinkLowerResult[];
  ram_indicators: number[];
  ram_indicator_names: string[];
}

export interface ResultLinkLowerResult {
  // ll_result
  id: number;
  name: string;
  applied_indicators: Indicator[];
  activities: InterventionActivity[];

  code?: string;
  created?: string;
  result_link?: number;
  cp_output: number | null;
}

export class IndicatorIndicator {
  id: number | null = null;
  title = '';
  display_type = 'percentage';
  unit = 'number';
}

export class Indicator {
  // Indicator
  id: number | null = null;
  is_active = true;
  is_high_frequency = false;
  indicator: IndicatorIndicator | null = new IndicatorIndicator();
  section: number | null = null;
  baseline: {v?: string | number; d?: string | number} = {};
  target: {v?: string | number; d: string | number} = {d: '1'};
  means_of_verification: string | null = null;
  locations: number[] = [];
  disaggregation: string[] = [];

  cluster_name: string | null = null;
  cluster_indicator_id: number | null = null;
  cluster_indicator_title: string | null = null;
  response_plan_name: string | null = null;
  numerator_label = '';
  denominator_label = '';
}

export interface CpOutput {
  id: number;
  name: string;
  wbs: string;
  country_programme: string;
}

export class PlannedBudget {
  currency?: string;
  unicef_cash_local?: string;
  total?: string;
  in_kind_amount_local?: string;
  partner_contribution_local?: string;
}

export class InterventionAttachment {
  id?: number;
  active = true;
  type?: number;
  intervention?: number;
  attachment_document?: string | number | File;
  [key: string]: undefined | number | string | boolean | File;
}

export class FrsDetails {
  currencies_match = false;
  earliest_start_date: string | null = null;
  frs: Fr[] = [];
  latest_end_date: string | null = null;
  multi_curr_flag = false;
  total_actual_amt = 0;
  total_frs_amt = '0';
  total_intervention_amt = 0;
  total_outstanding_amt = 0;
}

export interface Fr {
  id: number;
  currency: string;
  fr_number: string;
  line_item_details: [];
  end_date: string;
  start_date: string;
  actual_amt: string;
  actual_amt_local: string;
  outstanding_amt: string;
  outstanding_amt_local: string;
  total_amt: string;
  total_amt_local: string;
  vendor_code: string;
}

export class PlannedVisit {
  id: number | null = null;
  year: string | null = null;
  programmatic_q1 = '0';
  programmatic_q2 = '0';
  programmatic_q3 = '0';
  programmatic_q4 = '0';
  programmatic: any;
}

export class InterventionSupplyItem {
  id: number | null = null;
  created?: string;
  modified?: string;
  title = '';
  unit_number: number | undefined = undefined;
  unit_price: number | undefined = undefined;
  result = '';
  total_price: number | undefined = undefined;
  other_mentions = '';
  intervention = '';
  outputs: string[] = [];
}

export class InterventionPermissionsFields {
  id = false;
  status = false;

  // details - Partnership Information
  agreement = false;
  document_type = false;
  number = false;
  title = false;
  offices = false;
  unicef_focal_points = false;
  partner_focal_points = false;

  // details - PD or SSFA Details
  contingency_pd = false;
  country_programme = false;
  start = false;
  end = false;
  sections = false;
  flat_locations = false;
  reporting_requirements = false;

  // details - PD Output or SSFA Expected results
  result_links = false;

  // details - Planned Budget
  planned_budget = false;
  planned_budget_unicef_cash = false; // TODO: this should be also received from backend

  // details - Planned Visits
  planned_visits = false;

  technical_guidance = false;
  capacity_development = false;
  other_partners_involved = false;
  other_info = false;

  // review & sign - Signatures & Dates
  submission_date = false;
  submission_date_prc = false;
  review_date_prc = false;
  prc_review_attachment = false;
  partner_authorized_officer_signatory = false;
  signed_by_partner_date = false;
  unicef_signatory = false;
  signed_by_unicef_date = false;
  signed_pd_attachment = false;

  // review & sign - Amendments
  amendments = false;

  // review & sign - FR Numbers
  frs = false;

  locations = false;

  // attachments
  attachments = false;

  // financial component
  cash_transfer_modalities = false;
  hq_support_cost = false;
}

export interface Permission<T> {
  edit: T;
  required: T;
}

export class Intervention {
  id: number | null = null;
  agreement?: number;
  document_type?: string;
  country_programme?: number;
  number?: string;
  reference_number_year?: string | null = null;
  prc_review_attachment?: number | string;
  signed_pd_attachment?: number | string;
  title?: string;
  status = '';
  start = '';
  end = '';
  submitted_to_prc = false;
  submission_date_prc?: string;
  review_date_prc?: string;
  submission_date?: string;
  signed_by_unicef_date?: string;
  signed_by_partner_date?: string;
  unicef_signatory?: string;
  unicef_focal_points: [] = [];
  partner?: string;
  partner_focal_points: [] = [];
  partner_vendor = '';
  partner_authorized_officer_signatory?: string;
  offices: [] = [];
  sections: [] = [];
  frs: number[] = [];
  frs_details = new FrsDetails();
  contingency_pd?: boolean;
  planned_budget = new PlannedBudget();
  flat_locations: [] = [];
  result_links: ExpectedResult[] = [];
  planned_visits: PlannedVisit[] = [];
  in_amendment = false;
  amendments: InterventionAmendment[] = [];
  quarters: InterventionQuarter[] = [];
  locations: [] = [];
  // distributions: [];
  activation_letter_attachment: number | string | null = null;
  technical_guidance = '';
  capacity_development = '';
  other_partners_involved = '';
  other_info = '';
  attachments: InterventionAttachment[] = [];
  permissions?: Permission<InterventionPermissionsFields>;
  humanitarian_flag?: boolean;
  partner_id?: string;
  // @lajos: for financial component
  cash_transfer_modalities = '';
  hq_support_cost = '';
}

export class InterventionAmendment {
  id?: number;
  intervention?: number;
  created?: string;

  amendment_number: string | null = null;
  types: string[] = [];
  other_description: string | null = null;
  signed_date: string | null = null;
  signed_amendment_attachment: number | string | null = null;
  internal_prc_review: number | string | null = null;
}

export type InterventionActivity = {
  id: number;
  context_details: string;
  cso_cash: string;
  cso_supplies: string;
  items: InterventionActivityItem[];
  name: string;
  time_frames: InterventionActivityTimeframe[];
  unicef_cash: string;
  unicef_suppies: number;
};

export type InterventionActivityItem = {
  name: string;
  other_details: string;
  unicef_cash: string;
  cso_cash: string;
};

export type InterventionActivityTimeframe = InterventionQuarter & {
  enabled: boolean;
};

export type InterventionQuarter = {
  start: string;
  end: string;
  name: string;
};

export interface ResultIndicator {
  current: number;
  id: number;
  name: string;
  result: number;
  sector_current: null | number;
  sector_total: null | number;
  total: null | number;
  unit: null | number;
}
