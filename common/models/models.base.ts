import pick from 'lodash-es/pick';
import {Intervention, InterventionPermissionsFields, PlannedBudget} from './intervention.types';
import {AnyObject} from './globals.types';

export class ModelsBase {
  setObjProperties(dataSource: Intervention | InterventionPermissionsFields | PlannedBudget) {
    Object.assign(this, pick(dataSource, Object.keys(this as AnyObject)));
  }
  setObjProperty(propKey: string, propValue: AnyObject) {
    (<any>this)[propKey] = propValue;
  }
}
