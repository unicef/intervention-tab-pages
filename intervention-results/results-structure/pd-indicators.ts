import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import {Indicator} from '../../common/models/intervention.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {Disaggregation, DisaggregationValue, LocationObject, Section} from '../../common/models/globals.types';

@customElement('pd-indicators')
export class PdIndicators extends connect(getStore())(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          --blue-background: #b6d5f1;
          --blue-background-dark: #a4c4e1;
          display: block;
          background: var(--blue-background);
        }
      `
    ];
  }

  @property({type: Array}) indicators: Indicator[] = [];
  @property() private locations: LocationObject[] = [];
  @property() private sections: Section[] = [];
  @property() private disaggregations: Disaggregation[] = [];

  protected render(): TemplateResult {
    // language=HTML
    return html`
      <style>
        :host etools-data-table-row {
          --list-bg-color: var(--blue-background);
          --list-second-bg-color: var(--blue-background);
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            background-color: var(--blue-background-dark);
            border-top: 1px solid var(--main-border-color);
          }
          --list-row-wrapper: {
            min-height: 55px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: none !important;
          }
        }
        .editable-row .hover-block {
          background-color: var(--blue-background) !important;
        }
      </style>

      <div class="row-h align-items-center header">
        <div class="heading flex-auto">
          PD Indicators
          <iron-icon icon="add-box"></iron-icon>
        </div>
        <div class="heading number-data flex-none">Baseline</div>
        <div class="heading number-data flex-none">Target</div>
      </div>

      ${this.indicators.map(
        (indicator: Indicator) => html`
          <etools-data-table-row>
            <div slot="row-data" class="layout-horizontal">
              <!--    Indicator name    -->
              <div class="text flex-auto">
                ${(indicator.indicator && indicator.indicator.title) || '-'}
              </div>

              <!--    Baseline    -->
              <div class="text number-data flex-none">
                ${indicator.baseline.v || '-'}
              </div>

              <!--    Target    -->
              <div class="text number-data flex-none">
                ${indicator.target.v || '-'}
              </div>
            </div>

            <!--    Indicator row collapsible Details    -->
            <div slot="row-data-details" class="row-h">
              <!--    Locations    -->
              <div class="details-container">
                <div class="text details-heading">Locations</div>
                <div class="details-text">
                  ${indicator.locations.length
                    ? indicator.locations.map(
                        (location: number) => html`
                          <div class="details-list-item">${this.getLocationName(location)}</div>
                        `
                      )
                    : '-'}
                </div>
              </div>

              <!--    Section and Cluster    -->
              <div class="details-container">
                <div class="text details-heading">Section/Cluster</div>
                <div class="details-text">${this.getSectionAndCluster(indicator.section, indicator.cluster_name)}</div>
              </div>

              <!--    Disagregations    -->
              <div class="details-container">
                <div class="text details-heading">Disagregation</div>
                <div class="details-text">
                  ${indicator.disaggregation.length
                    ? indicator.disaggregation.map((disaggregation: string) => this.getDisaggregation(disaggregation))
                    : '-'}
                </div>
              </div>
            </div>
          </etools-data-table-row>
        `
      )}
      ${!this.indicators.length
        ? html`
            <div class="layout-horizontal empty-row">
              <div class="text flex-auto">-</div>
              <div class="text number-data flex-none">-</div>
              <div class="text number-data flex-none">-</div>
            </div>
          `
        : ''}
    `;
  }

  stateChanged(state: any): void {
    this.sections = (state.commonData && state.commonData.sections) || [];
    this.locations = (state.commonData && state.commonData.locations) || [];
    this.disaggregations = (state.commonData && state.commonData.disaggregations) || [];
  }

  getLocationName(id: string | number): string {
    const location: LocationObject | undefined = this.locations.find(
      (location: LocationObject) => location.id === String(id)
    );
    return location ? `${location.name} [${location.p_code}]` : '';
  }

  getDisaggregation(disaggregationId: string | number): TemplateResult {
    const disaggregation: Disaggregation | null =
      this.disaggregations.find(({id}: Disaggregation) => String(id) === String(disaggregationId)) || null;
    const values: string =
      (disaggregation &&
        disaggregation.disaggregation_values.map(({value}: DisaggregationValue) => value).join(', ')) ||
      '';
    return disaggregation && values
      ? html` <div class="details-list-item"><b>${disaggregation.name}</b>: ${values}</div> `
      : html``;
  }

  getSectionAndCluster(sectionId: number | null, clusterName: string | null): string {
    const section: Section | null =
      (sectionId && this.sections.find(({id}: Section) => String(id) === String(sectionId))) || null;
    return (
      [(section && section.name) || null, clusterName || null]
        .filter((name: string | null) => Boolean(name))
        .join(' / ') || '-'
    );
  }
}
