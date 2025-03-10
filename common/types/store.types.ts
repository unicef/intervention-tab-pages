import {CommentsCollection} from '../components/comments/comments.reducer';
import {
  AnyObject,
  Disaggregation,
  EnvFlags,
  LabelAndValue,
  LocationObject,
  Site,
  MinimalAgreement,
  RouteDetails,
  Intervention,
  CpOutput,
  Section,
  GenericObject,
  EtoolsUser,
  CountryProgram,
  EWorkPlan
} from '@unicef-polymer/etools-types';
import {CommentsEndpoints} from '../components/comments/comments-types';
import {UploadStatusState} from '../reducers/upload-status';

export interface AppState {
  routeDetails: RouteDetails;
  toastNotification: {
    active: boolean;
    message: string;
    showCloseBtn: boolean;
  };
}

export interface InterventionsState {
  current: Intervention | null;
  interventionLoading: number | null;
  partnerReportingRequirements: PartnerReportingRequirements;
  shouldReGetList: boolean;
}

export interface AgreementsState {
  list: MinimalAgreement[] | null;
}

export interface UserState {
  data: EtoolsUser | null;
  permissions: AnyObject | null;
}

export interface CommonDataState {
  unicefUsersData: [];
  partners: [];
  locations: LocationObject[];
  sites: Site[];
  sections: Section[];
  disaggregations: Disaggregation[];
  cpOutputs: CpOutput[];
  locationTypes: [];
  documentTypes: [];
  genderEquityRatings: [];
  interventionAmendmentTypes: LabelAndValue[];
  interventionStatuses: LabelAndValue[];
  offices: [];
  currencies: LabelAndValue[];
  envFlags: EnvFlags | null;
  riskTypes: LabelAndValue[];
  fileTypes: any[];
  cashTransferModalities: any[];
  PRPCountryData: any[];
  countryProgrammes: CountryProgram[];
  loadedTimestamp: number;
  providedBy: LabelAndValue[];
  eWorkPlans: EWorkPlan[];
}

export interface RootState {
  app: AppState;
  interventions: InterventionsState;
  prcIndividualReviews: any[];
  agreements: AgreementsState;
  user: UserState;
  commonData: CommonDataState;
  commentsData: {
    commentsModeEnabled: boolean;
    collection: GenericObject<CommentsCollection>;
    endpoints: CommentsEndpoints;
  };
  uploadStatus: UploadStatusState;
  activeLanguage: any;
}

export interface PartnerReportingRequirements {
  qpr: any;
  hr: any;
  sr: any;
  special: any;
}
