import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import {LitElement, html, property, customElement} from 'lit-element';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox.js';
import {Indicator} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../../../utils/intervention-labels-map';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

/**
 * @customElement
 * @appliesMixin IndicatorsCommonMixin
 */
@customElement('non-cluster-indicator')
class NonClusterIndicator extends IndicatorsCommonMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: block;
        }

        .radioGroup {
          width: 320px;
        }

        paper-input,
        paper-textarea {
          display: inline-block;
          width: 100%;
        }

        paper-textarea {
          --paper-input-container-input: {
            display: block;
          }
        }

        .unknown {
          padding-left: 24px;
          padding-bottom: 16px;
          padding-top: 10px;
        }

        .no-left-padding {
          padding-left: 0 !important;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }

        .add-locations {
          padding-right: 0;
          align-items: flex-end;
        }

        .all-locations {
          margin: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .row-h {
          padding-top: 16px !important;
          padding-bottom: 0 !important;
        }

        .last-item {
          padding-bottom: 24px !important;
        }
      </style>

      <div class="row-h flex-c">
        <div class="layout-vertical">
          <label class="paper-label">${translate('TYPE')}</label>
          <div class="radioGroup">
            <paper-radio-group
              .disabled="${this.readonly}"
              .selected="${this.indicator!.indicator!.unit}"
              @selected-changed="${({detail}: CustomEvent) => {
                this.indicator!.indicator!.unit = detail.value;
                this._baselineChanged(this.indicator.baseline.v);
                this._targetChanged(this.indicator.target.v);
                this._typeChanged();
                this.requestUpdate();
              }}"
            >
              <paper-radio-button ?disabled="${this.isReadonly()}" class="no-left-padding" name="number"
                >${translate('QUANTITY_SCALE')}
              </paper-radio-button>
              <paper-radio-button ?disabled="${this.isReadonly()}" name="percentage"
                >${translate('PERCENT_RATIO')}</paper-radio-button
              >
            </paper-radio-group>
          </div>
        </div>
        <div class="layout-vertical" ?hidden="${this._unitIsNumeric(this.indicator!.indicator!.unit)}">
          <label class="paper-label">${translate('DISPLAY_TYPE')}</label>
          <div class="radioGroup">
            <paper-radio-group
              .selected="${this.indicator!.indicator!.display_type}"
              @selected-changed="${({detail}: CustomEvent) => {
                this.indicator!.indicator!.display_type = detail.value;
                this._typeChanged();
                this.requestUpdate();
              }}"
            >
              <paper-radio-button ?disabled="${this.isReadonly()}" class="no-left-padding" name="percentage"
                >${translate('PERCENTAGE')}
              </paper-radio-button>
              <paper-radio-button ?disabled="${this.isReadonly()}" name="ratio"
                >${translate('RATIO')}</paper-radio-button
              >
            </paper-radio-group>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <paper-input
          id="titleEl"
          required
          label=${translate('INDICATOR')}
          .value="${this.indicator!.indicator!.title}"
          placeholder="&#8212;"
          error-message=${translate('ADD_TITLE_ERR')}
          auto-validate
          ?readonly="${this.isReadonlyTitle()}"
          @value-changed="${({detail}: CustomEvent) => {
            if (detail.value === undefined) {
              return;
            }
            this.indicator!.indicator!.title = detail.value;
          }}"
        >
        </paper-input>
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c" ?hidden="${this._unitIsNumeric(this.indicator!.indicator!.unit)}">
        <div class="col col-3">
          <paper-input
            id="numeratorLbl"
            label=${translate(translatesMap.numerator_label)}
            .value="${this.indicator.numerator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.numerator_label = detail.value;
            }}"
          >
          </paper-input>
        </div>
        <div class="col col-3">
          <paper-input
            id="denomitorLbl"
            label=${translate(translatesMap.denominator_label)}
            .value="${this.indicator.denominator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.denominator_label = detail.value;
            }}"
          >
          </paper-input>
        </div>
      </div>
      <div class="row-h flex-c">
        ${!this._isRatioType(this.indicator!.indicator!.unit, this.indicator!.indicator!.display_type)
          ? html` <div class="col col-3">
                ${this._unitIsNumeric(this.indicator!.indicator!.unit)
                  ? html`<etools-currency-amount-input
                      id="baselineNumeric"
                      label=${translate('BASELINE')}
                      .value="${this.indicator.baseline.v ?? ''}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.indicator.baseline.v = detail.value;
                        this._baselineChanged(this.indicator.baseline.v);
                      }}"
                      error-message=${translate('INVALID_NUMBER')}
                      ?disabled="${this.baselineIsUnknown || this.readonly}"
                      ?readonly="${this.readonly}"
                      ?hidden="${!this._unitIsNumeric(this.indicator!.indicator!.unit)}"
                    ></etools-currency-amount-input>`
                  : html``}
                ${!this._unitIsNumeric(this.indicator!.indicator!.unit)
                  ? html` <paper-input
                      id="baselineNonNumeric"
                      label=${translate('BASELINE')}
                      .value="${this.indicator.baseline.v}"
                      allowed-pattern="[0-9]"
                      .pattern="${this.digitsPattern}"
                      auto-validate
                      error-message=${translate('INVALID_NUMBER')}
                      placeholder="&#8212;"
                      ?disabled="${this.baselineIsUnknown || this.readonly}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.indicator.baseline.v = detail.value;
                        this._baselineChanged(this.indicator.baseline.v);
                        this.resetValidations();
                      }}"
                    >
                    </paper-input>`
                  : html``}
              </div>
              <div class="col col-3">
                <etools-currency-amount-input
                  id="targetElForNumericUnit"
                  required
                  label=${translate('TARGET')}
                  .value="${this.indicator.target.v}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                  }}"
                  error-message=${translate('VALID_TARGET_ERR')}
                  ?readonly="${this.readonly}"
                  ?hidden="${!this._unitIsNumeric(this.indicator!.indicator!.unit)}"
                ></etools-currency-amount-input>
                <paper-input
                  label=${translate('TARGET')}
                  id="targetElForNonNumericUnit"
                  .value="${this.indicator.target.v}"
                  placeholder="&#8212;"
                  allowed-pattern="[0-9]"
                  required
                  .pattern="${this.digitsPattern}"
                  auto-validate
                  error-message=${translate('VALID_TARGET_ERR')}
                  ?readonly="${this.readonly}"
                  ?hidden="${this._unitIsNumeric(this.indicator!.indicator!.unit)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                    this.resetValidations();
                  }}"
                >
                </paper-input>
              </div>`
          : html``}
        ${this._isRatioType(this.indicator!.indicator!.unit, this.indicator!.indicator!.display_type)
          ? html` <div class="col-3 layout-horizontal">
                <paper-input
                  id="baselineNumerator"
                  label=${translate(translatesMap.baseline)}
                  .value="${this.indicator.baseline.v}"
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  error-message=${translate('INVALID_ERR')}
                  placeholder=${translate('NUMERATOR')}
                  ?disabled="${this.baselineIsUnknown || this.readonly}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.baseline.v = detail.value;
                    this._baselineChanged(this.indicator.baseline.v);
                  }}"
                >
                </paper-input>
                <div class="layout-horizontal bottom-aligned dash-separator">/</div>
                <paper-input
                  id="baselineDenominator"
                  .value="${this.indicator.baseline.d}"
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  error-message=${translate('INVALID_ERR')}
                  placeholder=${translate('DENOMINATOR')}
                  ?disabled="${this.baselineIsUnknown || this.readonly}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.baseline.d = detail.value;
                  }}"
                >
                </paper-input>
              </div>
              <div class="col col-3">
                <paper-input
                  label=${translate('TARGET')}
                  id="targetNumerator"
                  .value="${this.indicator.target.v}"
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  required
                  error-message=${translate('INVALID_ERR')}
                  placeholder=${translate('NUMERATOR')}
                  ?readonly="${this.readonly}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                  }}"
                >
                </paper-input>
                <div class="layout-horizontal bottom-aligned dash-separator">/</div>
                <paper-input
                  id="targetDenominator"
                  .value="${this.indicator.target.d}"
                  required
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  error-message=${translate('TARGET_DENOMINATOR_ERR')}
                  placeholder=${translate('DENOMINATOR')}
                  ?readonly="${this.isReadonlyDenominator(this.interventionStatus, this.indicator.id) || this.readonly}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.d = detail.value;
                  }}"
                >
                </paper-input>
              </div>`
          : html``}
        <div class="col col-6" ?hidden=${!this.isUnicefUser}>
          <paper-toggle-button
            ?checked="${this.indicator.is_high_frequency}"
            ?disabled="${this.readonly || !this.isUnicefUser}"
            @iron-change="${this.isHighFrequencyChanged}"
          >
            ${translate(translatesMap.is_high_frequency)}
          </paper-toggle-button>
        </div>
      </div>
      <div class="unknown">
        <paper-checkbox
          ?checked="${this.baselineIsUnknown}"
          ?disabled="${this.readonly}"
          @checked-changed="${({target}: CustomEvent) =>
            this.baselineIsUnknownChanged(Boolean((target as PaperCheckboxElement).checked))}"
          >${translate('UNKNOWN')}</paper-checkbox
        >
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c">
        <paper-textarea
          label=${translate(translatesMap.means_of_verification)}
          type="text"
          .value="${this.indicator.means_of_verification}"
          ?readonly="${this.readonly}"
          placeholder="&#8212;"
          @value-changed="${({detail}: CustomEvent) => {
            this.indicator.means_of_verification = detail.value;
          }}"
        >
        </paper-textarea>
      </div>
      <div class="last-item row-h flex-c">
        <etools-dropdown-multi
          id="locationsDropdw"
          label=${translate(translatesMap.locations)}
          placeholder="&#8212;"
          .selectedValues="${this.indicator.locations}"
          .options="${this.locationOptions}"
          option-label="name"
          option-value="id"
          required
          auto-validate
          error-message=${translate('LOCATIONS_ERR')}
          fit-into="etools-dialog"
          ?readonly="${this.readonly}"
          trigger-value-change-event
          @etools-selected-items-changed="${({detail}: CustomEvent) => {
            const newIds = detail.selectedItems.map((i: any) => i.id);
            this.indicator.locations = newIds;
          }}"
        >
        </etools-dropdown-multi>
        <div class="all-locations">
          <paper-button
            class="secondary-btn add-locations"
            ?hidden="${this.readonly}"
            @click="${this._addAllLocations}"
            title=${translate('ADD_ALL_LOCATIONS')}
          >
            ${translate('ADD_ALL')}
          </paper-button>
        </div>
      </div>
    `;
  }

  private _indicator = new Indicator();

  @property({type: Object})
  get indicator() {
    return this._indicator;
  }

  set indicator(indicator: Indicator) {
    this._indicator = indicator;
    this._indicatorChanged(this._indicator);
  }

  @property({type: Boolean}) // observer: '_readonlyChanged'
  indicatorIsNew = false;

  @property({type: Boolean})
  readonly = false;

  @property({type: Array})
  locationOptions!: [];

  @property({type: Boolean})
  baselineIsUnknown!: boolean;

  @property({type: String})
  interventionStatus!: string;

  @property({type: Boolean})
  isUnicefUser = false;

  private isHighFrequencyChanged(e: CustomEvent) {
    const chk = e.target as PaperCheckboxElement;
    if (chk.checked === undefined || chk.checked === null) {
      return;
    }
    this.indicator.is_high_frequency = chk.checked;
  }

  private isReadonly() {
    return this.readonly || !this.indicatorIsNew;
  }

  private isReadonlyTitle() {
    return (
      this.readonly ||
      (!this.indicatorIsNew && !['draft', 'development'].includes(this.interventionStatus.toLowerCase()))
    );
  }

  private baselineIsUnknownChanged(checked: boolean) {
    this.baselineIsUnknown = checked;
    if (this.baselineIsUnknown) {
      this.indicator.baseline = {v: null, d: 1};
      this.requestUpdate();
    }
  }

  _unitIsNumeric(unit: string) {
    return unit === 'number';
  }

  _indicatorChanged(indicator: Indicator) {
    if (!indicator) {
      return;
    }
    if (!this.indicator.id) {
      this.baselineIsUnknown = false;
      this.indicatorIsNew = true;
    } else {
      this.baselineIsUnknown = !indicator.baseline || this._isEmptyExcept0(indicator.baseline.v as any);
      this.indicatorIsNew = false;
    }
  }

  isReadonlyDenominator(interventionStatus: string, indicId: string | null) {
    if (interventionStatus && interventionStatus.toLowerCase() === 'active') {
      return indicId ? true : false;
    }
    return false;
  }

  _typeChanged() {
    this.resetValidations();
  }

  validate() {
    const elemIds = ['titleEl', 'locationsDropdw'];
    ([] as string[]).push.apply(elemIds, this._getIndicatorTargetElId());
    return this.validateComponents(elemIds);
  }

  resetValidations() {
    setTimeout(() => {
      const elemIds = ['titleEl', 'locationsDropdw'];
      ([] as string[]).push.apply(elemIds, this._getIndicatorTargetElId());

      let i;
      for (i = 0; i < elemIds.length; i++) {
        const elem = this.shadowRoot!.querySelector('#' + elemIds[i]) as HTMLElement & {invalid: boolean};
        if (elem) {
          elem.invalid = false;
        }
      }
    }, 10);
  }

  _getIndicatorTargetElId() {
    if (!this.indicator || !this.indicator.indicator) {
      return ['targetElForNumericUnit', 'baselineNumeric'];
    }
    if (this._getIndUnit() === 'percentage' && this._getIndDisplayType() === 'ratio') {
      return ['baselineNumerator', 'baselineDenominator', 'targetNumerator', 'targetDenominator'];
    }
    return this._unitIsNumeric(this.indicator.indicator.unit)
      ? ['targetElForNumericUnit', 'baselineNumeric']
      : ['targetElForNonNumericUnit', 'baselineNonNumeric'];
  }

  _isRatioType(_unit: string, _displayType: string) {
    if (!this.indicator) {
      return false;
    }
    return this._getIndDisplayType() === 'ratio' && this._getIndUnit() === 'percentage';
  }

  _getIndDisplayType() {
    return this.indicator.indicator!.display_type;
  }

  _getIndUnit() {
    return this.indicator.indicator!.unit;
  }

  _addAllLocations() {
    const locationIDs = this.locationOptions.map((x: any) => x.id);
    this.indicator.locations = locationIDs;
    this.requestUpdate();
  }
}

export {NonClusterIndicator as NonClusterIndicatorEl};
