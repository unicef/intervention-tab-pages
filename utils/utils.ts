export const removeCurrencyAmountDelimiter = (value: any) => {
  if (!value && value != 0) {
    return '';
  }
  value = value.toString();
  if (value === '') {
    return '';
  }
  return value.replace(/,/g, '');
};

// Both unit and displayType are used because of inconsitencies in the db.
export const getIndicatorDisplayType = (indicator: any) => {
  const unit = indicator ? indicator.unit : '';
  const displayType = indicator ? indicator.display_type : '';
  if (!unit) {
    return '';
  }
  let typeChar = '';
  switch (unit) {
    case 'number':
      typeChar = '#';
      break;
    case 'percentage':
      if (displayType === 'percentage') {
        typeChar = '%';
      } else if (displayType === 'ratio') {
        typeChar = '÷';
      }
      break;
    default:
      break;
  }
  return typeChar;
};

export function getPageDirection(state: any) {
  if (state.activeLanguage?.activeLanguage === 'ar') {
    return 'rtl';
  }
  return 'ltr';
}

export function resetInvalidElement(event: any): void {
  if (event && event.target) {
    event.target.invalid = false;
  }
}

export const detailsTextareaRowsCount = (editable: boolean) => {
  return editable ? 3 : 1;
};

export const isActiveTab = (tab: string, expectedTab: string): boolean => {
  return tab === expectedTab;
};
