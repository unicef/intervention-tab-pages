import {ModelsBase} from '../../common/models/models.base';
import {InterventionPermissionsFields, Intervention} from '../../common/models/intervention.types';

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
  gender = true;
  equity = true;
  sustainability = true;
}
