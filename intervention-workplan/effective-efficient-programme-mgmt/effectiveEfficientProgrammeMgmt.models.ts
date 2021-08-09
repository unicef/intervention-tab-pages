import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export enum KindChoices {
  inCountry = 'in_country',
  operational = 'operational',
  planning = 'planning'
}

export class ProgrammeManagement extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention.management_budgets!);
    this.currency = intervention.planned_budget.currency!;
  }
  act1_unicef = '0';
  act1_partner = '0';
  act1_total = '0';
  act2_unicef = '0';
  act2_partner = '0';
  act2_total = '0';
  act3_unicef = '0';
  act3_partner = '0';
  act3_total = '0';
  total = '0';
  currency = '';
  items = [];
}

export class ProgrammeManagementActivityPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  management_budgets = false;
}
