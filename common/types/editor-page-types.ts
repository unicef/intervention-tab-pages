import {InterventionActivityItem, ManagementBudgetItem} from '@unicef-polymer/etools-types/dist/intervention.types';
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
  id: number;
  code: string;
  inEditMode: boolean;
  invalid: Partial<InvalidItem>;
  autovalidate: Partial<AutovalidateItem>;
};

type AutovalidateItem = {
  name: boolean;
  unit: boolean;
  [prop: string]: boolean;
};
type InvalidItem = {
  name: boolean;
  unit: boolean;
  no_units: boolean;
  unit_price: boolean;
  cso_cash: boolean;
  unicef_cash: boolean;
};

export type InterventionActivityExtended = InterventionActivity & {
  inEditMode: boolean;
  itemsInEditMode: boolean;
  invalid: Partial<ItemInvalid>;
  total: string;
};

type ItemInvalid = {name: boolean; context_details: boolean; time_frames: boolean};

export type ResultLinkLowerResultExtended = ResultLinkLowerResult & {
  inEditMode: boolean;
  invalid: boolean;
  invalidCpOutput: boolean;
};

export enum ProgrammeManagementKindChoices {
  inCountry = 'in_country',
  operational = 'operational',
  planning = 'planning'
}

export type ProgrammeManagementRowItemExtended = ManagementBudgetItem & {
  id?: number;
  code: string;
  inEditMode: boolean;
  invalid: Partial<InvalidItem>;
  autovalidate: Partial<AutovalidateItem>;
};

export type ProgrammeManagementRow = {
  code: string;
  name: string;
  context_details: string;
  cso_cash: string;
  unicef_cash: string;
  totalProgrammeManagementCash: number;
  total: string;
  items: ProgrammeManagementRowItemExtended[];
  id: number;
  kind: ProgrammeManagementKindChoices;
  inEditMode: boolean;
  itemsInEditMode: boolean;
};

export type ProgrammeManagementRowExtended = ProgrammeManagementRow & {
  inEditMode: boolean;
  itemsInEditMode: boolean;
  invalid?: Partial<{unicef_cash: boolean; cso_cash: boolean}>;
  total: string;
};
