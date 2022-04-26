export const removeCurrencyAmountDelimiter = (value: any) => {
  if (!value) {
    return '';
  }
  value = value.toString();
  if (value === '') {
    return '';
  }
  return value.replace(/,/g, '');
};
