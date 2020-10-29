import {Intervention, InterventionPermissionsFields} from '@unicef-polymer/etools-types';
import {ModelsBase} from '../../common/models/models.base';

export class GenderEquityRating extends ModelsBase {
  constructor(intervention: Intervention) {
    super();
    this.setObjProperties(intervention);
  }
  gender_rating = '';
  gender_narrative = '';
  equity_rating = '';
  equity_narrative = '';
  sustainability_rating = '';
  sustainability_narrative = '';
}

export class GenderEquityRatingPermissions extends ModelsBase {
  constructor(permissions: InterventionPermissionsFields) {
    super();
    this.setObjProperties(permissions);
  }
  gender_rating = true;
  equity_rating = true;
  sustainability_rating = true;
  gender_narrative = true;
  equity_narrative = true;
  sustainability_narrative = true;
}
