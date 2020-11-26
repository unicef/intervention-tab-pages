// lodash slows down page loads , so we're using a local/native version of the methods

import {AnyObject} from '@unicef-polymer/etools-types';

export function pick(object: AnyObject, keys: any[]) {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
}

export const isEmpty = (obj: any) => {
  if (obj === 0 || obj.constructor === Date) {
    return false;
  }
  return [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;
};

export const get = (obj: AnyObject | null | undefined, path: string, defaultValue = undefined) => {
  if (!obj) {
    return '';
  }
  const travel = (regexp: any) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const isObject = (obj: any) => {
  return !Array.isArray(obj) && !(obj instanceof Date) && typeof obj === 'object';
};

export const sortBy = (key: string, asc = true) => {
  if (asc) {
    return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
  } else {
    return (a: any, b: any) => (a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0);
  }
};
