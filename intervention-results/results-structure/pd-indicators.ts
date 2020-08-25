import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import {Indicator, Intervention} from '../../common/models/intervention.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {Disaggregation, DisaggregationValue, LocationObject, Section} from '../../common/models/globals.types';
import {openDialog} from '../../utils/dialog';
import './modals/indicator-dialog/indicator-dialog';
import get from 'lodash-es/get';
import {isJsonStrMatch} from '../../../../../utils/utils';
import {filterByIds} from '../../utils/utils';
import EnvironmentFlagsMixin from '../../common/mixins/environment-flags-mixin';
import {IndicatorDialogData} from './modals/indicator-dialog/types';
import cloneDeep from 'lodash-es/cloneDeep';

@customElement('pd-indicators')
export class PdIndicators extends connect(getStore())(EnvironmentFlagsMixin(LitElement)) {
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
  @property() pdOutputId!: string;

  /** On create/edit indicator only sections already saved on the intervention can be selected */
  set interventionSections(ids: string[]) {
    this.indicatorSectionOptions = filterByIds<Section>(this.sections, ids);
  }
  set interventionLocations(ids: string[]) {
    this.indicatorLocationOptions = filterByIds<LocationObject>(this.locations, ids);
  }

  private indicatorSectionOptions!: Section[];
  private indicatorLocationOptions!: LocationObject[];

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
          <iron-icon icon="add-box" @click="${() => this.openIndicatorDialog()}"></iron-icon>
        </div>
        <div class="heading number-data flex-none">Baseline</div>
        <div class="heading number-data flex-none">Target</div>
      </div>

      ${this.indicators.map(
        (indicator: Indicator) => html`
          <etools-data-table-row>
            <div slot="row-data" class="layout-horizontal editable-row">
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
              <div class="hover-block">
                <paper-icon-button
                  icon="icons:create"
                  @tap="${() => this.openIndicatorDialog(indicator)}"
                ></paper-icon-button>
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
    /**
     * Computing here to avoid recomputation on every open indicator dialog
     */
    this.computeAvailableOptionsForIndicators(get(state, 'interventions.current'));
    this.envFlagsStateChanged(state);
  }

  computeAvailableOptionsForIndicators(intervention: Intervention) {
    if (!isJsonStrMatch(this.interventionLocations, intervention.flat_locations)) {
      this.interventionLocations = intervention.flat_locations;
    }
    if (!isJsonStrMatch(this.interventionSections, intervention.sections)) {
      this.interventionSections = intervention.sections;
    }
  }

  openIndicatorDialog(indicator?: Indicator) {
    openDialog<IndicatorDialogData>({
      dialog: 'indicator-dialog',
      dialogData: {
        indicator: indicator ? cloneDeep(indicator) : null,
        sectionOptions: this.indicatorSectionOptions,
        locationOptions: this.indicatorLocationOptions,
        llResultId: this.pdOutputId,
        prpServerOn: this.prpServerIsOn()!,
        toastEventSource: this
      }
    });
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

  getSectionAndCluster(sectionId: string | null, clusterName: string | null): string {
    const section: Section | null =
      (sectionId && this.sections.find(({id}: Section) => String(id) === String(sectionId))) || null;
    return (
      [(section && section.name) || null, clusterName || null]
        .filter((name: string | null) => Boolean(name))
        .join(' / ') || '-'
    );
  }
}
