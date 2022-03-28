import {InterventionActivityItem} from '@unicef-polymer/etools-types/dist/intervention.types';
import {Indicator} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';

export interface ExpectedResultExtended {
  id: number;
  code: string;
  cp_output: number;
  cp_output_name: string;
  intervention: number;
  ll_results: ResultLinkLowerResultExtended[];
  ram_indicators: number[];
  ram_indicator_names: string[];
  total: string;
}

export declare type InterventionActivity = {
  id: number;
  code: string;
  context_details: string;
  cso_cash: string;
  cso_supplies: string;
  items: InterventionActivityItemExtended[];
  name: string;
  time_frames: number[];
  unicef_cash: string;
  unicef_suppies: number;
};

export interface ResultLinkLowerResult {
  id: number;
  name: string;
  applied_indicators: Indicator[];
  activities: InterventionActivityExtended[];
  code?: string;
  created?: string;
  result_link?: number;
  cp_output: number | null;
  total: string;
}

export type InterventionActivityItemExtended = InterventionActivityItem & {
  inEditMode: boolean;
  invalid: {name: boolean; no_units: boolean; unit_price: boolean};
};

export type InterventionActivityExtended = InterventionActivity & {
  inEditMode: boolean;
  itemsInEditMode: boolean;
  invalid: {name: boolean; context_details: boolean; time_frames: boolean};
  total: string;
};

export type ResultLinkLowerResultExtended = ResultLinkLowerResult & {
  inEditMode: boolean;
  invalid: boolean;
};
