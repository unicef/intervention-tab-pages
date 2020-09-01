import {LitElement, html, customElement, css, property, TemplateResult} from 'lit-element';
import {Disaggregation, DisaggregationValue} from '../../common/models/globals.types';
import {Indicator} from '../../common/models/intervention.types';
import {fireEvent} from '../../utils/fire-custom-event';

@customElement('pd-indicator')
export class PdIndicator extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .indicatorType {
      font-weight: 600;
      font-size: 16px;
      margin-right: 4px;
    }
  `;
  @property() private disaggregations: Disaggregation[] = [];
  @property({type: Array}) indicator!: Indicator;
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Array}) locationNames: string[] = [];
  @property({type: String}) sectionClusterNames = '';

  render() {
    return html`
      <etools-data-table-row>
        <div slot="row-data" class="layout-horizontal editable-row">
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
}
