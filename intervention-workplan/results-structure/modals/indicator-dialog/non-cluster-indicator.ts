import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {Indicator} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../../../utils/intervention-labels-map';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import {EtoolsDropdownMulti} from '@unicef-polymer/etools-unicef/src/etools-dropdown/EtoolsDropdownMulti';
import SlCheckbox from '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';

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

        etools-input,
        etools-textarea,
        etools-dropdown {
          width: 100%;
        }

        .unknown {
          padding-inline-start: 24px;
          padding-bottom: 16px;
          padding-top: 10px;
        }

        .no-left-padding {
          padding-inline-start: 0 !important;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }

        .add-locations {
          padding-inline-end: 0;
          align-items: flex-end;
        }

        .all-locations {
          display: flex;
          flex-direction: column;
          justify-content: end;
        }

        .row-h {
          padding-top: 16px !important;
          padding-bottom: 0 !important;
        }

        .last-item {
          padding-bottom: 24px !important;
        }
        .mr-12 {
          margin-inline-end: 12px;
        }
        .mr-20 {
          margin-inline-end: 20px;
        }
        sl-switch {
          margin-top: 25px;
        }
        sl-radio {
          display: inline-block;
        }
        sl-radio-group {
          margin-top: 10px;
        }
      </style>

      <div class="row-h flex-c">
        <div class="layout-vertical mr-20">
          <label class="label">${translate('TYPE')}</label>
          <div class="radioGroup">
            <sl-radio-group
              .disabled="${this.readonly}"
              .value="${this.indicator!.indicator!.unit}"
              @sl-change="${(e: any) => {
                this.indicator!.indicator!.unit = e.target.value;
                this._baselineChanged(this.indicator.baseline.v);
                this._targetChanged(this.indicator.target.v);
                this._typeChanged();
                this.requestUpdate();
              }}"
            >
              <sl-radio ?disabled="${this.isReadonly()}" class="no-left-padding mr-12" value="number"
                >${translate('QUANTITY_SCALE')}
              </sl-radio>
              <sl-radio ?disabled="${this.isReadonly()}" class="no-left-padding" value="percentage"
                >${translate('PERCENT_RATIO')}</sl-radio
              >
            </sl-radio-group>
          </div>
        </div>
        <div class="layout-vertical" ?hidden="${this._unitIsNumeric(this.indicator!.indicator!.unit)}">
          <label class="label">${translate('DISPLAY_TYPE')}</label>
          <div class="radioGroup">
            <sl-radio-group
              .value="${this.indicator!.indicator!.display_type}"
              @sl-change="${(e: any) => {
                this.indicator!.indicator!.display_type = e.target.value;
                this._typeChanged();
                this.requestUpdate();
              }}"
            >
              <sl-radio ?disabled="${this.isReadonly()}" class="no-left-padding mr-12" value="percentage"
                >${translate('PERCENTAGE')}
              </sl-radio>
              <sl-radio ?disabled="${this.isReadonly()}" class="no-left-padding" value="ratio"
                >${translate('RATIO')}</sl-radio
              >
            </sl-radio-group>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <etools-input
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
        </etools-input>
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c" ?hidden="${this._unitIsNumeric(this.indicator!.indicator!.unit)}">
        <div class="col col-3">
          <etools-input
            id="numeratorLbl"
            label=${translate(translatesMap.numerator_label)}
            .value="${this.indicator.numerator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.numerator_label = detail.value;
            }}"
          >
          </etools-input>
        </div>
        <div class="col col-3">
          <etools-input
            id="denomitorLbl"
            label=${translate(translatesMap.denominator_label)}
            .value="${this.indicator.denominator_label}"
            placeholder="&#8212;"
            ?readonly="${this.readonly}"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.denominator_label = detail.value;
            }}"
          >
          </etools-input>
        </div>
      </div>
      <div class="row-h flex-c">
        ${!this._isRatioType(this.indicator!.indicator!.unit, this.indicator!.indicator!.display_type)
          ? html` <div class="col col-3">
                ${this._unitIsNumeric(this.indicator!.indicator!.unit)
                  ? html`<etools-currency
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
                    ></etools-currency>`
                  : html``}
                ${!this._unitIsNumeric(this.indicator!.indicator!.unit)
                  ? html` <etools-input
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
                    </etools-input>`
                  : html``}
              </div>
              <div class="col col-3">
                <etools-currency
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
                ></etools-currency>
                <etools-input
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
                </etools-input>
              </div>`
          : html``}
        ${this._isRatioType(this.indicator!.indicator!.unit, this.indicator!.indicator!.display_type)
          ? html` <div class="col-3 layout-horizontal">
                <etools-input
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
                </etools-input>
                <div class="layout-horizontal bottom-aligned dash-separator">/</div>
                <etools-input
                  id="baselineDenominator"
                  always-float-label
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
                </etools-input>
              </div>
              <div class="col col-3">
                <etools-input
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
                </etools-input>
                <div class="layout-horizontal bottom-aligned dash-separator">/</div>
                <etools-input
                  id="targetDenominator"
                  always-float-label
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
                </etools-input>
              </div>`
          : html``}
        <div class="col col-6" ?hidden=${!this.isUnicefUser}>
          <sl-switch
            ?checked="${this.indicator.is_high_frequency}"
            ?disabled="${this.readonly || !this.isUnicefUser}"
            @sl-change="${this.isHighFrequencyChanged}"
          >
            ${translate(translatesMap.is_high_frequency)}
          </sl-switch>
        </div>
      </div>
      <div class="unknown">
        <sl-checkbox
          ?checked="${this.baselineIsUnknown}"
          ?disabled="${this.readonly}"
          @sl-change="${({target}: CustomEvent) =>
            this.baselineIsUnknownChanged(Boolean((target as SlCheckbox).checked))}"
          >${translate('UNKNOWN')}</sl-checkbox
        >
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c">
        <etools-textarea
          label=${translate(translatesMap.means_of_verification)}
          type="text"
          .value="${this.indicator.means_of_verification}"
          ?readonly="${this.readonly}"
          placeholder="&#8212;"
          @value-changed="${({detail}: CustomEvent) => {
            this.indicator.means_of_verification = detail.value;
          }}"
        >
        </etools-textarea>
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
          <sl-button
            variant="text"
            ?hidden="${this.readonly}"
            @click="${this._addAllLocations}"
            title=${translate('ADD_ALL_LOCATIONS')}
          >
            ${translate('ADD_ALL')}
          </sl-button>
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
    const chk = e.target as SlSwitch;
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
    setTimeout(() => this.shadowRoot?.querySelector<EtoolsDropdownMulti>('#locationsDropdw')!.validate());
  }
}

export {NonClusterIndicator as NonClusterIndicatorEl};
