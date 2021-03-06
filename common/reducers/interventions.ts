import {UPDATE_CURRENT_INTERVENTION, UPDATE_PARTNER_REPORTING_REQUIREMENTS} from '../actionsConstants';
import {Intervention} from '@unicef-polymer/etools-types';
import {PartnerReportingRequirements} from '../types/store.types';

export interface InterventionsState {
  current: Intervention | null;
  partnerReportingRequirements: PartnerReportingRequirements;
}

const INITIAL_STATE: InterventionsState = {
  current: null,
  partnerReportingRequirements: {special: [], qpr: [], hr: [], sr: []}
};

export const interventions = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case UPDATE_CURRENT_INTERVENTION:
      return {
        ...state,
        current: action.current
      };
    case UPDATE_PARTNER_REPORTING_REQUIREMENTS:
      return {
        ...state,
        partnerReportingRequirements: action.partnerReportingRequirements
      };
    default:
      return state;
  }
};
