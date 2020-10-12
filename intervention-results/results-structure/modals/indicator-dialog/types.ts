import {Indicator} from '../../../../common/models/intervention.types';
import {Section, LocationObject} from '../../../../common/models/globals.types';

export type IndicatorDialogData = {
  indicator: Indicator | null;
  sectionOptions: Section[];
  locationOptions: LocationObject[];
  llResultId: string;
  prpServerOn: boolean;
  readonly: boolean | undefined;
};
