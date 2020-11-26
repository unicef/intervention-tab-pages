import {Intervention, InterventionPermissionsFields, PlannedBudget} from '@unicef-polymer/etools-types';
import {AnyObject, ManagementBudget} from '@unicef-polymer/etools-types';
import {pick} from '../../utils/lodash-alternative';

export class ModelsBase {
  setObjProperties(dataSource: Intervention | InterventionPermissionsFields | PlannedBudget | ManagementBudget) {
    Object.assign(this, pick(dataSource, Object.keys(this as AnyObject)));
  }
  setObjProperty(propKey: string, propValue: AnyObject) {
    (<any>this)[propKey] = propValue;
  }
}
