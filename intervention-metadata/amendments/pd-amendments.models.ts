import {InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class PdAmendmentPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  amendments = true;
}

export enum AmendmentsKind {
  normal = 'normal',
  contingency = 'contingency'
}

export const AmendmentsKindTranslateKeys = {
  [AmendmentsKind.normal]: 'NORMAL',
  [AmendmentsKind.contingency]: 'CONTINGENCY'
};
