import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {LitElement, property} from 'lit-element';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 */
function IndicatorsCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class IndicatorsCommonClass extends baseClass {
    [x: string]: any;

    @property({type: String}) // allow only decimals separator `.` or `,`. ex: 1000,00 or 1000.00
    numberPattern = '(^\\d+(\\.?\\d+)?$)|(^\\d+(,?\\d+)?$)';

    @property({type: String}) // any number starting from 1
    digitsNotStartingWith0Pattern = '^[1-9]{1}(\\d+)?$';

    @property({type: String})
    digitsPattern = '^\\d+';

    _baselineChanged(baselineV?: string | number | null) {
      if (!this.indicator || this._isEmptyExcept0(baselineV)) {
        return;
      }

      if (this._displayTypeIsPercentage(this.indicator)) {
        const val = this._getValidPercentageValue(baselineV);

        this.indicator.baseline.v = val;
        this.requestUpdate();
      }
    }

    _targetChanged(targetV?: string | number | null) {
      if (!this.indicator || this._isEmptyExcept0(targetV)) {
        return;
      }
      if (this._displayTypeIsPercentage(this.indicator)) {
        const val = this._getValidPercentageValue(targetV);
        this.indicator.target.v = val;
        this.requestUpdate();
      }
    }

    _isEmptyExcept0(value?: string | number | null) {
      return value === null || value === undefined || value === '';
    }

    _displayTypeIsPercentage(indicator: any) {
      return (
        indicator.indicator && indicator.indicator.unit === 'percentage' && indicator.indicator.display_type !== 'ratio'
      );
    }

    _getValidPercentageValue(val: any) {
      val = parseInt(val, 10);
      if (isNaN(val) || val < 0) {
        val = 0;
      }
      if (val > 100) {
        val = 100;
      }
      return val;
    }

    validateComponents(elemIds: string[]) {
      let valid = true;
      elemIds.forEach((elemId) => {
        const elem = this.shadowRoot!.querySelector('#' + elemId) as HTMLElement & {validate(): boolean};
        if (elem) {
          valid = elem.validate() && valid;
        } else {
          logWarn('Elem ' + elemId + ' not found');
        }
      });
      return valid;
    }
  }

  return IndicatorsCommonClass;
}
export default IndicatorsCommonMixin;
