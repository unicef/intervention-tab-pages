import isArray from 'lodash-es/isArray';
import isObject from 'lodash-es/isObject';

export const isJsonStrMatch = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const isEmptyObject = (a: any) => {
  if (!a) {
    return true;
  }
  if (isArray(a) && a.length === 0) {
    return true;
  }
  return isObject(a) && Object.keys(a).length === 0;
};

export const cloneDeep = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const getFileNameFromURL = (url: string) => {
  if (!url) {
    return '';
  }
  // @ts-ignore
  return url.split('?').shift().split('/').pop();
};
