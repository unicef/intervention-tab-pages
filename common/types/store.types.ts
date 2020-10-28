import {CommentsCollection} from '../components/comments/comments.reducer';

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
  commentsData: {
    commentsModeEnabled: boolean;
    collection: GenericObject<CommentsCollection>;
  };
}
