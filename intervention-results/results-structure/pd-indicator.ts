import {LitElement, html, customElement, css, property, TemplateResult} from 'lit-element';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {Disaggregation, DisaggregationValue} from '../../common/models/globals.types';
import {Indicator} from '../../common/models/intervention.types';
import {fireEvent} from '../../utils/fire-custom-event';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {ResultStructureStyles} from './results-structure.styles';

@customElement('pd-indicator')
export class PdIndicator extends LitElement {
  static get styles() {
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        etools-data-table-row {
          --blue-background: #b6d5f1;
          --blue-background-dark: #a4c4e1;
          display: block;
          --list-row-wrapper_-_background-color: var(--blue-background);
          --list-row-wrapper_-_align-items: stretch;
        }
        .indicatorType {
          font-weight: 600;
          font-size: 16px;
          margin-right: 4px;
        }
        div[slot='row-data-details'] {
          --blue-background-dark: #a4c4e1;
          background: var(--blue-background-dark);
        }
        .hover-block {
          background-color: var(--blue-background) !important;
        }
      `
    ];
  }
  @property() private disaggregations: Disaggregation[] = [];
  @property({type: Array}) indicator!: Indicator;
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Array}) locationNames: string[] = [];
  @property({type: String}) sectionClusterNames = '';
  @property({type: Boolean}) showInactiveIndicators!: boolean;

  render() {
    return this._hideIndicator(this.indicator, this.showInactiveIndicators)
      ? html``
      : html`
          ${this.getIndicatorTypeStyle(this.indicator)}
          <etools-data-table-row>
            <div slot="row-data" class="layout-horizontal align-items-center editable-row">
              <!--    Indicator name    -->
              <div class="text flex-auto">
                ${this.getIndicatorDisplayType(this.indicator.indicator!.unit, this.indicator.indicator!.display_type)}
                ${this.addInactivePrefix(this.indicator)}
                ${(this.indicator.indicator && this.indicator.indicator.title) || '-'}
              </div>

              <!--    Baseline    -->
              <div class="text number-data flex-none">${this.indicator.baseline.v || '-'}</div>

              <!--    Target    -->
              <div class="text number-data flex-none">${this.indicator.target.v || '-'}</div>
              <div class="hover-block" ?hidden="${this.readonly}">
                <paper-icon-button
                  icon="icons:create"
                  ?hidden="${!this.indicator.is_active}"
                  @tap="${() => this.openIndicatorDialog(this.indicator)}"
                ></paper-icon-button>
                <paper-icon-button
                  icon="icons:block"
                  ?hidden="${!this.indicator.is_active}"
                  @tap="${() => this.openDeactivationDialog(String(this.indicator.id))}"
                ></paper-icon-button>
              </div>
            </div>

            <!--    Indicator row collapsible Details    -->
            <div slot="row-data-details" class="row-h">
              <!--    Locations    -->
              <div class="details-container">
                <div class="text details-heading">Locations</div>
                <div class="details-text">
                  ${this.locationNames.length
                    ? this.locationNames.map((name: string) => html` <div class="details-list-item">${name}</div> `)
                    : '-'}
                </div>
              </div>

              <!--    Section and Cluster    -->
              <div class="details-container">
                <div class="text details-heading">Section/Cluster</div>
                <div class="details-text">${this.sectionClusterNames}</div>
              </div>

              <!--    Disagregations    -->
              <div class="details-container">
                <div class="text details-heading">Disagregation</div>
                <div class="details-text">
                  ${this.indicator.disaggregation.length
                    ? this.indicator.disaggregation.map((disaggregation: string) =>
                        this.getDisaggregation(disaggregation)
                      )
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

  _hideIndicator(indicator: any, showInactiveIndicators: boolean) {
    if (!indicator.is_active) {
      return !showInactiveIndicators;
    }
    return false;
  }

  // Both unit and displayType are used because of inconsitencies in the db.
  getIndicatorDisplayType(unit: string, displayType: string) {
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

  getIndicatorTypeStyle(indicator: any) {
    let dynamicStyle = '';
    let hfBgImg = '';
    if (indicator.cluster_indicator_id) {
      hfBgImg = `linear-gradient(135deg, #066ac7 12.50%, #c4d7c6 12.50%, #c4d7c6 50%, #066ac7 50%,
         #066ac7 62.50%, #c4d7c6 62.50%, #c4d7c6 100%)`;
      dynamicStyle = `--collapse-icon-bg-color: var(--indicator-green); --collapse-icon-bg-image: ${hfBgImg};`;
    } else if (indicator.is_high_frequency) {
      hfBgImg = `linear-gradient(135deg, #066ac7 12.50%, #a4c4e1 12.50%, #a4c4e1 50%, #066ac7 50%,
        #066ac7 62.50%, #a4c4e1 62.50%, #a4c4e1 100%)`;
      dynamicStyle = `--collapse-icon-bg-color: var(--indicator-blue); --collapse-icon-bg-image: ${hfBgImg};`;
    }

    const style = `{
      --indicator-blue:#a4c4e1; --indicator-green:#c4d7c6;
       ${dynamicStyle}
      --icon-wrapper: {
        background-color: var(--collapse-icon-bg-color, var(--indicator-blue));
        background-image: var(--collapse-icon-bg-image, none);
        background-size: 5.66px 5.66px;
        padding: 0px 0px;
        margin-right: 16px;
      }
    }`;
    return html`<style>
      etools-data-table-row ${style}
    </style>`;
  }
}
