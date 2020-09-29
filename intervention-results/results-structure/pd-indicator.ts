import {LitElement, html, customElement, property, TemplateResult} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {Disaggregation, DisaggregationValue} from '../../common/models/globals.types';
import {Indicator} from '../../common/models/intervention.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {ResultStructureStyles} from './results-structure.styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';

@customElement('pd-indicator')
export class PdIndicator extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, ResultStructureStyles];
  }
  @property() private disaggregations: Disaggregation[] = [];
  @property({type: Array}) indicator!: Indicator;
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Array}) locationNames: {name: string; adminLevel: string}[] = [];
  @property({type: String}) sectionClusterNames = '';

  render() {
    return html`
      <style>
        ${sharedStyles} :host {
          --indicator-blue: #a4c4e1;
          --indicator-green: #c4d7c6;
        }
        :host etools-data-table-row {
          --icon-wrapper: {
            padding: 0px 0px !important;
            margin-right: 16px !important;
          }
        }
        :host([high-frequency-indicator]) etools-data-table-row {
          --icon-wrapper: {
            background: var(--indicator-blue)
              linear-gradient(
                135deg,
                #066ac7 12.5%,
                #a4c4e1 12.5%,
                #a4c4e1 50%,
                #066ac7 50%,
                #066ac7 62.5%,
                #a4c4e1 62.5%,
                #a4c4e1 100%
              )
              center/5.66px 5.66px;
          }
        }
        :host([cluster-indicator]) etools-data-table-row {
          --icon-wrapper: {
            background: var(--indicator-green)
              linear-gradient(
                135deg,
                #066ac7 12.5%,
                #c4d7c6 12.5%,
                #c4d7c6 50%,
                #066ac7 50%,
                #066ac7 62.5%,
                #c4d7c6 62.5%,
                #c4d7c6 100%
              )
              center/5.66px 5.66px;
          }
        }
        etools-data-table-row {
          --blue-background: #b6d5f1;
          --blue-background-dark: #a4c4e1;
          display: block;
          --list-row-wrapper_-_background-color: var(--blue-background);
          --list-row-wrapper_-_align-items: stretch;
          --list-row-collapse-wrapper_-_margin-bottom: 0px;
        }
        .indicatorType {
          font-weight: 600;
          font-size: 16px;
          margin-right: 4px;
        }
        div[slot='row-data-details'] {
          --blue-background-dark: #a4c4e1;
          background: var(--blue-background-dark);
          max-height: 220px;
          overflow: auto;
        }
        .hover-block {
          background-color: var(--blue-background) !important;
        }
        etools-data-table-row {
          --list-row-collapse-wrapper: {
            padding: 0;
            margin: 0;
          }
        }
        .font-bold {
          font-weight: bold;
        }
      </style>
      <etools-data-table-row>
        <div slot="row-data" class="layout-horizontal align-items-center editable-row">
          <!--    Indicator name    -->
          <div class="text flex-auto">
            ${this.getIndicatorDisplayType(this.indicator)}
            ${this.addInactivePrefix(this.indicator)}
            ${(this.indicator.indicator ? this.indicator.indicator.title : (this.indicator.cluster_indicator_title || '-')) || '-'}
          </div>

          <!--    Baseline    -->
          <div class="text number-data flex-none">
            ${this._displayBaselineOrTarget(
              this.indicator.baseline,
              this.indicator
            )}
          </div>

          <!--    Target    -->
          <div class="text number-data flex-none">
            ${this._displayBaselineOrTarget(
              this.indicator.target,
              this.indicator
            )}
          </div>
          <div class="hover-block">
            <paper-icon-button
              icon="icons:create"
              ?hidden="${!this.indicator.is_active || this.readonly}"
              @click="${() => this.openIndicatorDialog(this.indicator)}"
            ></paper-icon-button>
            <paper-icon-button
              icon="icons:block"
              ?hidden="${!this.indicator.is_active || this.readonly}"
              @click="${() => this.openDeactivationDialog(String(this.indicator.id))}"
            ></paper-icon-button>
          </div>
        </div>

        <!--    Indicator row collapsible Details    -->
        <div slot="row-data-details" class="row-h">
          <!--    Locations    -->
          <div class="details-container-locations">
            <div class="text details-heading">Locations</div>
            <div class="details-text">
              ${this.locationNames.length
                ? this.locationNames.map(
                    (name) =>
                      html`
                        <div class="details-list-item">
                          <span class="font-bold">${name.name}</span>
                          ${name.adminLevel}
                        </div>
                      `
                  )
                : '-'}
            </div>
          </div>

          <!--    Section and Cluster    -->
          <div class="details-container">
            <div class="text details-heading">Section/Cluster</div>
            <div class="details-text">${this.sectionClusterNames}</div>
          </div>

          <!--    Disaggregations    -->
          <div class="details-container">
            <div class="text details-heading">Disaggregation</div>
            <div class="details-text">
              ${this.indicator.disaggregation.length
                ? this.indicator.disaggregation.map((disaggregation: string) => this.getDisaggregation(disaggregation))
                : '-'}
            </div>
          </div>
        </div>
      </etools-data-table-row>
    `;
  }
  openDeactivationDialog(indicatorId: string) {
    fireEvent(this, 'open-deactivate-confirmation', {indicatorId: indicatorId});
  }
  openIndicatorDialog(indicator: Indicator) {
    fireEvent(this, 'open-edit-indicator-dialog', {indicator: indicator});
  }

  // Both unit and displayType are used because of inconsitencies in the db.
  getIndicatorDisplayType(indicator: Indicator) {
    const unit = indicator.indicator ? indicator.indicator!.unit : '';
    const displayType = indicator.indicator ? indicator.indicator!.display_type : '';
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
    return html`<span class="indicatorType">${typeChar} </span>`;
  }

  getDisaggregation(disaggregationId: string | number): TemplateResult {
    const disaggreg: Disaggregation | null =
      this.disaggregations.find(({id}: Disaggregation) => String(id) === String(disaggregationId)) || null;
    const values: string =
      (disaggreg && disaggreg.disaggregation_values.map(({value}: DisaggregationValue) => value).join(', ')) || '';
    return disaggreg && values
      ? html` <div class="details-list-item"><b>${disaggreg.name}</b>: ${values}</div> `
      : html``;
  }

  private addInactivePrefix(indicator: any) {
    return !indicator || indicator.is_active ? '' : html`<strong>(inactive)</strong>`;
  }

  _displayBaselineOrTarget(item: any, indicator: Indicator) {
    if (!item) {
      return '—';
    }
    if (!item.v && parseInt(item.v) !== 0) {
      return '—';
    }

    const isCluster = indicator.cluster_indicator_id;
    if (isCluster && this._clusterIndIsRatio(item)) {
      return item.v + ' / ' + item.d;
    }
    const unit = indicator.indicator ? indicator.indicator!.unit : '';
    const displayType = indicator.indicator ? indicator.indicator!.display_type : '';
    if (unit === 'percentage' && displayType === 'ratio') {
      return item.v + ' / ' + item.d;
    }

    return item.v;
  }

  _clusterIndIsRatio(item: any) {
    return item.d && parseInt(item.d) !== 1 && parseInt(item.d) !== 100;
  }
}
