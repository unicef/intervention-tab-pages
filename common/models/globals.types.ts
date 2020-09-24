import {PolymerElement} from '@polymer/polymer';
import {Intervention, CpOutput} from './intervention.types';
import {MinimalAgreement} from './agreement.types';
import {InterventionComment} from '../types/types';

/*
 * The type Constructor<T> is an alias for the construct signature
 * that describes a type which can construct objects of the generic type T
 * and whose constructor function accepts an arbitrary number of parameters of any type
 * On the type level, a class can be represented as a newable function
 */
export type Constructor<T> = new (...args: any[]) => T;

export interface AnyObject {
  [key: string]: any;
}

export type GenericObject<T> = {
  [key: string]: T;
};

export type LocationObject = {
  id: string;
  name: string;
  p_code: string;
  parent: string;
  gateway: {
    id: number;
    created: string;
    modified: string;
    name: string;
    admin_level: null;
  };
};

export type Section = {
  id: string;
  created: string;
  modified: string;
  name: string;
  description: string;
  alternate_id: null;
  alternate_name: string;
  dashboard: boolean;
  color: string;
  active: boolean;
};

export type Disaggregation = {
  active: boolean;
  disaggregation_values: DisaggregationValue[];
  id: number;
  name: string;
};

export type DisaggregationValue = {
  active: boolean;
  id: number;
  value: string;
};

export interface Permission<T> {
  edit: T;
  required: T;
}

export interface UserPermissions {
  ICT: boolean;
  PME: boolean;
  editAgreementDetails: boolean;
  editInterventionDetails: boolean;
  editPartnerDetails: boolean;
  loggedInDefault: boolean;
  partnershipManager: boolean;
  userInfoMenu: boolean;
  viewAgreementDetails: boolean;
  viewInterventionDetails: boolean;
  viewPartnerDetails: boolean;
}

export class MinimalUser {
  first_name!: string;
  last_name!: string;
  middle_name!: string;
  name!: string;
  email!: string;
}

export class User extends MinimalUser {
  country!: MinimalCountry;
  country_override!: number;
  countries_available!: MinimalCountry[];
  groups!: UserGroup[];
  is_unicef_user!: boolean;
}

export interface EtoolsUserModel {
  countries_available: MinimalCountry[];
  groups: UserGroup[];
  country: AnyObject;
  country_override: number;
  email: string;
  first_name: string;
  guid: string;
  is_active: string;
  is_staff: string;
  is_superuser: string;
  job_title: string;
  last_login: string;
  last_name: string;
  middle_name: string;
  name: string;
  office: string | null;
  oic: any;
  user: number;
  username: string;
  vendor_number: string | null;
  [key: string]: any;
}

export interface UserGroup {
  id: number;
  name: string;
  permissions: any[];
}

export interface EtoolsTab {
  tab: string;
  tabLabel: string;
  hidden?: boolean;
  showTabCounter?: boolean;
  counter?: number;
}

export interface DomRepeatEvent extends CustomEvent {
  // TODO- should be in polymer declarations
  model: any;
}

export class Paginator {
  page = 1;
  page_size = 10;
  count: number | null = null;
  visible_range: string[] | number[] = [];
}

export interface CpStructure {
  id: string;
  name: string;
  expired: boolean;
  future: boolean;
  active: boolean;
  special: boolean;
  invalid: boolean;
  from_date: string;
  to_date: string;
  wbs: string;
}

export interface MinimalCountry {
  id: number;
  name: string;
  business_area_code: string;
}

export interface Country extends MinimalCountry {
  country_short_code: string;
  initial_zoom: number;
  latitude: string;
  local_currency: string;
  local_currency_code: string;
  local_currency_id: number;
  longitude: string;
}

export interface LabelAndValue {
  label: string;
  value: string;
}

export interface IdAndName {
  id: string;
  name: string;
}

export interface EnvFlags {
  prp_mode_off: boolean;
  prp_server_on: boolean;
  active_flags?: string[];
}

export interface Office {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface ValidatableField extends PolymerElement {
  invalid: boolean;
  validate: () => any; // validate method for polymer form input elements
}

export interface RouteQueryParam {
  [key: string]: string;
}
export interface RouteParams {
  [key: string]: number | string;
}

export interface RouteQueryParams {
  [key: string]: string;
}

export interface RouteCallbackParams {
  matchDetails: string[];
  queryParams: RouteQueryParams;
}

export interface RouteDetails {
  routeName: string;
  subRouteName: string | null;
  path: string;
  queryParams: RouteQueryParam | null;
  params: RouteParams | null;
}

export interface AppState {
  routeDetails: RouteDetails;
  drawerOpened: boolean;
  toastNotification: {
    active: boolean;
    message: string;
    showCloseBtn: boolean;
  };
}

export interface InterventionsState {
  current: Intervention | null;
}

export interface AgreementsState {
  list: MinimalAgreement[] | null;
}

export interface UserState {
  data: EtoolsUserModel | null;
  permissions: AnyObject | null;
}

export interface CommonDataState {
  unicefUsersData: [];
  partners: AnyObject[];
  locations: LocationObject[];
  sections: Section[];
  disaggregations: Disaggregation[];
  cpOutputs: CpOutput[];
  locationTypes: [];
  documentTypes: [];
  genderEquityRatings: LabelAndValue[];
  interventionAmendmentTypes: LabelAndValue[];
  offices: [];
  envFlags: EnvFlags | null;
  currencies: LabelAndValue[];
  // used on PMP
  PRPCountryData?: AnyObject[];
  riskTypes: LabelAndValue[];
  cashTransferModalities: LabelAndValue[];
}

export interface RootState {
  app: AppState;
  interventions: InterventionsState;
  agreements: AgreementsState;
  user: UserState;
  commonData: CommonDataState;
  commentsData: GenericObject<InterventionComment[]>;
}
