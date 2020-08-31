import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import {Indicator, Intervention} from '../../common/models/intervention.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {Disaggregation, LocationObject, Section, RootState} from '../../common/models/globals.types';
import './modals/indicator-dialog/indicator-dialog';
import get from 'lodash-es/get';
import {filterByIds, isJsonStrMatch} from '../../utils/utils';
import EnvironmentFlagsMixin from '../../common/mixins/environment-flags-mixin';
import {IndicatorDialogData} from './modals/indicator-dialog/types';
import cloneDeep from 'lodash-es/cloneDeep';
import '../../common/layout/are-you-sure';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getIntervention} from '../../common/actions';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from '../../utils/fire-custom-event';
import {openDialog} from '../../utils/dialog';

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
        .indicatorType {
          font-weight: 600;
          font-size: 16px;
          margin-right: 4px;
        }
      `
    ];
  }

  @property({type: Array}) indicators: Indicator[] = [];
  @property() private locations: LocationObject[] = [];
  @property() private sections: Section[] = [];
  @property() private disaggregations: Disaggregation[] = [];
  @property() pdOutputId!: string;
  @property({type: Boolean})
  editMode!: boolean;

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
          <iron-icon
            icon="add-box"
            @click="${() => this.openIndicatorDialog()}"
            ?hidden="${!this.editMode}"
          ></iron-icon>
        </div>
        <div class="heading number-data flex-none">Baseline</div>
        <div class="heading number-data flex-none">Target</div>
      </div>

      ${this.indicators.map(
        (indicator: Indicator) => html`
          <pd-indicator
            .indicator="${indicator}"
            .disaggregations="${this.disaggregations}"
            .locationNames="${this.getLocationNames(indicator.locations)}"
            .sectionClusterNames="${this.getSectionAndCluster(indicator.section, indicator.cluster_name)}"
            @open-edit-indicator-dialog="${(e: CustomEvent) => this.openIndicatorDialog(e.detail.indicator)}"
            @open-deactivate-confirmation="${(e: CustomEvent) => this.openDeactivationDialog(e.detail.indicatorId)}"
          ></pd-indicator>
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

  stateChanged(state: RootState): void {
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

  async openDeactivationDialog(indicatorId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to deactivate this indicator?',
        confirmBtnText: 'Deactivate'
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deactivateIndicator(indicatorId);
    }
  }

  deactivateIndicator(indicatorId: string) {
    const endpoint = getEndpoint(interventionEndpoints.getEditDeleteIndicator, {
      id: indicatorId
    });
    sendRequest({
      method: 'PATCH',
      endpoint: endpoint,
      body: {
        is_active: false
      }
    })
      .then((_resp: any) => {
        // TODO - use relatedIntervention
        getStore().dispatch(getIntervention());
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
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

  getLocationNames(ids: string[]): string[] {
    const locations = filterByIds<LocationObject>(this.locations, ids);
    const locNames: string[] = [];
    locations.forEach((l) => {
      locNames.push(`${l.name} [${l.p_code}]`);
    });
    return locNames;
  }
}
