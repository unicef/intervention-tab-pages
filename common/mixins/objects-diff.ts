import {isEqual} from 'lodash-es';

export type DataComparisonOptions = {
  toRequest?: boolean;
  nestedFields?: string[];
  strongComparison?: boolean;
};

export function simplifyValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((obj: any) => (obj && Object.hasOwnProperty.call(obj, 'id') && obj.id) || obj);
  }
  if (value && Object.hasOwnProperty.call(value, 'id')) {
    return value.id;
  }
  return value;
}

function areEquals(first: any, second: any): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    const arr1: any[] = first.length < second.length ? second : first;
    const arr2: any[] = first.length < second.length ? first : second;
    return arr1.every((item: any, index: number) => areEquals(item, arr2[index]));
  } else if (typeof first === 'object' && typeof second === 'object') {
    return isEqual(first, second);
  }
  return isEqual(`${first}`, `${second}`);
}

export function getDifference<T>(
  originalData: Partial<T>,
  modifiedData: Partial<T>,
  options: DataComparisonOptions = {}
): Partial<T> {
  const {toRequest = false, strongComparison = false, nestedFields = []} = options;
  return Object.keys(modifiedData).reduce((changes: Partial<T>, key: string) => {
    const originalValue: any = originalData && originalData[key as keyof T];
    let modifiedValue: any = modifiedData && modifiedData[key as keyof T];
    if (originalValue === null && modifiedValue === null) {
      return changes;
    }

    let modifiedToCompare: any = modifiedValue;
    let originalToCompare: any = originalValue;

    const isNestedField: boolean = nestedFields.includes(key);
    const needsToBeSimplified: boolean =
      !isNestedField && (typeof originalValue === 'object' || typeof modifiedValue === 'object');

    if (needsToBeSimplified) {
      modifiedToCompare = simplifyValue(modifiedValue);
      originalToCompare = simplifyValue(originalValue);
    }

    const noChanges: boolean =
      strongComparison || isNestedField
        ? isEqual(modifiedToCompare, originalToCompare)
        : areEquals(modifiedToCompare, originalToCompare);

    if (noChanges) {
      return changes;
    }
    if (toRequest) {
      modifiedValue = modifiedToCompare;
    }
    return {...changes, [key]: modifiedValue};
  }, {});
}
