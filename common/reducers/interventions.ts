import {UPDATE_CURRENT_INTERVENTION, UPDATE_PARTNER_REPORTING_REQUIREMENTS} from '../actionsConstants';
import {Intervention} from '@unicef-polymer/etools-types';

export interface InterventionsState {
  current: Intervention | null;
  prr: any | null
}

const INITIAL_STATE: InterventionsState = {
  current: null,
  prr: null
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
        prr: action
      };
    default:
      return state;
  }
};
