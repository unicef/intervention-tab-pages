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
