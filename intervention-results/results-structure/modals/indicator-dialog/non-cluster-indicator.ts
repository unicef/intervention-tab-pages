import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import IndicatorsCommonMixin from './mixins/indicators-common-mixin';
import {LitElement, html, property} from 'lit-element';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../common/styles/button-styles';
import {Indicator} from '../../../../common/models/intervention.types';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox.js';

/**
 * @customElement
 * @appliesMixin IndicatorsCommonMixin
 */
class NonClusterIndicator extends IndicatorsCommonMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    return html`
      <style>
        ${sharedStyles} *[hidden] {
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
        }

        .no-left-padding {
          padding-left: 0px !important;
        }

        .dash-separator {
          padding: 0 8px 0 8px;
          margin-bottom: 10px;
        }

        .add-locations {
          padding-right: 0;
          @apply --layout-end;
          padding-bottom: 12px;
        }
      </style>

      <div class="row-h flex-c">
        <div class="layout-vertical">
          <label class="paper-label">Type </label>
          <div class="radioGroup">
            <paper-radio-group
              .selected="${this.indicator?.indicator?.unit}"
              @selected-changed="${({detail}: CustomEvent) => {
                this.indicator!.indicator!.unit = detail.value;
                this._baselineChanged(this.indicator.baseline.v);
                this._targetChanged(this.indicator.target.v);
                this._typeChanged();
              }}"
            >
              <paper-radio-button ?disabled="${this.readonly}" class="no-left-padding" name="number"
                >Quantity / Scale
              </paper-radio-button>
              <paper-radio-button ?disabled="${this.readonly}" name="percentage">Percent/Ratio</paper-radio-button>
            </paper-radio-group>
          </div>
        </div>
        <div class="layout-vertical" ?hidden="${this._unitIsNumeric(this.indicator.indicator.unit)}">
          <label class="paper-label">Display Type </label>
          <div class="radioGroup">
            <paper-radio-group
              .selected="${this.indicator.indicator.display_type}"
              @selected-changed="${({detail}: CustomEvent) => {
                this.indicator.indicator.display_type = detail.value;
                this._typeChanged();
              }}"
            >
              <paper-radio-button ?disabled="${this.readonly}" class="no-left-padding" name="percentage"
                >Percentage
              </paper-radio-button>
              <paper-radio-button ?disabled="${this.readonly}" name="ratio">
                Ratio
              </paper-radio-button>
            </paper-radio-group>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <paper-input
          id="titleEl"
          required
          label="Indicator"
          .value="{{indicator.indicator.title}}"
          placeholder="&#8212;"
          error-message="Please add a title"
          auto-validate
          ?readonly="${this.readonly}"
        >
        </paper-input>
      </div>

      <!-- Baseline & Target -->
      <div class="row-h flex-c" ?hidden="${this._unitIsNumeric(this.indicator.indicator.unit)}">
        <div class="col col-3">
          <paper-input
            id="numeratorLbl"
            label="Numerator Label"
            .value="${this.indicator.numerator_label}"
            placeholder="&#8212;"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.numerator_label = detail.value;
            }}"
          >
          </paper-input>
        </div>
        <div class="col col-3">
          <paper-input
            id="denomitorLbl"
            label="Denominator Label"
            .value="${this.indicator.denominator_label}"
            placeholder="&#8212;"
            @value-changed="${({detail}: CustomEvent) => {
              this.indicator.denominator_label = detail.value;
            }}"
          >
          </paper-input>
        </div>
      </div>
      <div class="row-h flex-c">
        ${!this._isRatioType(this.indicator.indicator.unit, this.indicator.indicator.display_type)
          ? html` <div class="col col-3">
                ${this._unitIsNumeric(this.indicator.indicator.unit)
                  ? html` <paper-input
                      id="baselineNumeric"
                      label="Baseline"
                      .value="${this.indicator.baseline.v}"
                      allowed-pattern="[0-9.,]"
                      .pattern="${this.numberPattern}"
                      auto-validate
                      error-message="Invalid number"
                      placeholder="&#8212;"
                      ?disabled="${this.baselineIsUnknown}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.indicator.baseline.v = detail.value;
                      }}"
                    >
                    </paper-input>`
                  : html``}
                ${!this._unitIsNumeric(this.indicator.indicator.unit)
                  ? html` <paper-input
                      id="baselineNonNumeric"
                      label="Baseline"
                      .value="${this.indicator.baseline.v}"
                      allowed-pattern="[0-9]"
                      .pattern="${this.digitsPattern}"
                      auto-validate
                      error-message="Invalid number"
                      placeholder="&#8212;"
                      ?disabled="${this.baselineIsUnknown}"
                      @value-changed="${({detail}: CustomEvent) => {
                        this.indicator.baseline.v = detail.value;
                        this._baselineChanged(this.indicator.baseline.v);
                      }}"
                    >
                    </paper-input>`
                  : html``}
              </div>
              <div class="col col-3">
                <paper-input
                  label="Target"
                  id="targetElForNumericUnit"
                  .value="${this.indicator.target.v}"
                  placeholder="&#8212;"
                  allowed-pattern="[0-9.,]"
                  required
                  .pattern="${this.numberPattern}"
                  auto-validate
                  error-message="Please add a valid target"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                  }}"
                  ?hidden="${!this._unitIsNumeric(this.indicator.indicator.unit)}"
                >
                </paper-input>
                <paper-input
                  label="Target"
                  id="targetElForNonNumericUnit"
                  .value="${this.indicator.target.v}"
                  placeholder="&#8212;"
                  allowed-pattern="[0-9]"
                  required
                  .pattern="${this.digitsPattern}"
                  auto-validate
                  error-message="Please add a valid target"
                  ?hidden="${this._unitIsNumeric(this.indicator.indicator.unit)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.v = detail.value;
                    this._targetChanged(this.indicator.target.v);
                  }}"
                >
                </paper-input>
              </div>`
          : html``}
        ${this._isRatioType(this.indicator.indicator.unit, this.indicator.indicator.display_type)
          ? html` <div class="col-3 layout-horizontal">
                <paper-input
                  id="baselineNumerator"
                  label="Baseline"
                  .value="${this.indicator.baseline.v}"
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  error-message="Invalid"
                  placeholder="Numerator"
                  ?disabled="${this.baselineIsUnknown}"
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
                  error-message="Invalid"
                  placeholder="Denominator"
                  ?disabled="${this.baselineIsUnknown}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.baseline.d = detail.value;
                  }}"
                >
                </paper-input>
              </div>
              <div class="col col-3">
                <paper-input
                  label="Target"
                  id="targetNumerator"
                  .value="${this.indicator.target.v}"
                  allowed-pattern="[0-9]"
                  .pattern="${this.digitsNotStartingWith0Pattern}"
                  auto-validate
                  required
                  error-message="Invalid"
                  placeholder="Numerator"
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
                  error-message="Empty or < 1"
                  placeholder="Denominator"
                  ?readonly="${this.isReadonlyDenominator(this.interventionStatus, this.indicator.id)}"
                  @value-changed="${({detail}: CustomEvent) => {
                    this.indicator.target.d = detail.value;
                  }}"
                >
                </paper-input>
              </div>`
          : html``}
        <div class="col col-6">
          <paper-toggle-button
            ?checked="${this.indicator.is_high_frequency}"
            @iron-change="${this.isHighFrequencyChanged}"
          >
            High Frequency Humanitarian Indicator
          </paper-toggle-button>
        </div>
      </div>
      <div class="unknown">
        <paper-checkbox
          ?checked="${this.baselineIsUnknown}"
          @checked-changed="${({target}: CustomEvent) =>
            this.baselineIsUnknownChanged(Boolean((target as PaperCheckboxElement).checked))}"
          >Unknown</paper-checkbox
        >
      </div>
      <!-- Baseline & Target -->
      <div class="row-h flex-c">
        <paper-textarea
          label="Means of Verification"
          type="text"
          .value="${this.indicator.means_of_verification}"
          placeholder="&#8212;"
          @value-changed="${({detail}: CustomEvent) => {
            this.indicator.means_of_verification = detail.value;
          }}"
        >
        </paper-textarea>
      </div>
      <div class="row-h flex-c">
        <etools-dropdown-multi
          id="locationsDropdw"
          label="Locations"
          placeholder="&#8212;"
          .selectedValues="${this.indicator.locations}"
          .options="${this.locationOptions}"
          option-label="name"
          option-value="id"
          required
          auto-validate
          error-message="Please select locations"
          disable-on-focus-handling
          fit-into="etools-dialog"
          trigger-value-change-event
          @etools-selected-items-changed="${({detail}: CustomEvent) => {
            const newIds = detail.selectedItems.map((i: any) => i.id);
            this.indicator.locations = newIds;
          }}"
        >
        </etools-dropdown-multi>
        <paper-button class="secondary-btn add-locations" @click="_addAllLocations" title="Add all locations">
          Add all
        </paper-button>
      </div>
    `;
  }

  private _indicator!: Indicator;

  @property({type: Object})
  get indicator() {
    return this._indicator;
  }

  set indicator(indicator: Indicator) {
    this._indicator = indicator;
    this._indicatorChanged(this._indicator);
  }

  @property({type: Boolean}) // observer: '_readonlyChanged'
  readonly = false;

  @property({type: Array})
  locationOptions!: [];

  @property({type: Boolean})
  baselineIsUnknown!: boolean;

  @property({type: String})
  interventionStatus!: string;

  // static get observers() {
  //   return [
  //     '_baselineChanged(indicator.baseline.v, indicator.indicator.unit)',
  //     '_targetChanged(indicator.target.v, indicator.indicator.unit)',
  //     '_baselineUnknownChanged(baselineIsUnknown)',
  //     '_typeChanged(indicator.indicator.display_type, indicator.indicator.unit)'
  //   ];
  // }

  private isHighFrequencyChanged() {
    this.indicator.is_high_frequency = !this.indicator.is_high_frequency;
  }

  private baselineIsUnknownChanged(checked: boolean) {
    this.baselineIsUnknown = checked;
    if (this.baselineIsUnknown) {
      this.indicator.baseline = {v: null, d: 1};
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
      this.readonly = false;
    } else {
      this.baselineIsUnknown = !indicator.baseline || this._isEmptyExcept0(indicator.baseline.v as any);
      this.readonly = true;
    }
  }

  isReadonlyDenominator(interventionStatus: string, indicId: string) {
    if (interventionStatus && interventionStatus.toLowerCase() === 'active') {
      return indicId ? true : false;
    }
    return false;
  }

  // TODO
  _readonlyChanged(newVal: boolean, oldVal: boolean) {
    if (newVal !== oldVal) {
      this.updateStyles();
    }
  }

  // _baselineUnknownChanged(isUnknown: boolean) {
  //   if (isUnknown) {
  //     this.set('indicator.baseline', {v: null, d: 1});
  //   }
  // }

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

  _isRatioType() {
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
    this.set('indicator.locations', locationIDs);
  }
}

window.customElements.define('non-cluster-indicator', NonClusterIndicator);
export {NonClusterIndicator as NonClusterIndicatorEl};
