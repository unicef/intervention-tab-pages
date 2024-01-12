import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

export function getTotalCash(
  csoCash: number | string,
  unicefCash: number | string,
  unfundedCash?: number | string
): number {
  return Number(((Number(csoCash) || 0) + (Number(unicefCash) || 0) + (Number(unfundedCash) || 0)).toFixed(2));
}
export function getTotalCashFormatted(
  csoCash: number | string,
  unicefCash: number | string,
  unfundedCash?: number | string
): string {
  return displayCurrencyAmount(String(getTotalCash(csoCash, unicefCash, unfundedCash)), '0', 2);
}

export function getMultiplyProductCash(unit: number | string, price: number | string): number {
  return Number(((Number(unit) || 0) * (Number(price) || 0)).toFixed(2));
}
export function getMultiplyProductCashFormatted(unit: number | string, price: number | string): string {
  return displayCurrencyAmount(String(getMultiplyProductCash(unit, price)), '0', 2);
}

export function getItemTotal(item: Partial<{no_units: number | string; unit_price: number | string}>): number {
  return getMultiplyProductCash(item.no_units || 0, item.unit_price || 0);
}
export function getItemTotalFormatted(item: Partial<{no_units: number | string; unit_price: number | string}>): string {
  return getMultiplyProductCashFormatted(item.no_units || 0, item.unit_price || 0);
}
