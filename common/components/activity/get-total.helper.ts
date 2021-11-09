import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

export function getTotal(csoCash: number | string, unicefCash: number | string): string {
  const total: number = (Number(csoCash) || 0) + (Number(unicefCash) || 0);
  return displayCurrencyAmount(String(total), '0', 2);
}
export function getMultiplyProduct(unit: number | string, price: number | string): string {
  const product: number = (Number(unit) || 0) * (Number(price) || 0);
  return displayCurrencyAmount(String(product), '0', 2);
}
