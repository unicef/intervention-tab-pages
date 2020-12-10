import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import {getStore} from '../../utils/redux-store-access';
import {RootState} from '../../common/types/store.types';
import './modals/indicator-dialog/indicator-dialog';
import get from 'lodash-es/get';
import {filterByIds, isJsonStrMatch} from '../../utils/utils';
import EnvironmentFlagsMixin from '../../common/mixins/environment-flags-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '../../common/layout/are-you-sure';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getIntervention} from '../../common/actions/interventions';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {fireEvent} from '../../utils/fire-custom-event';
import {openDialog} from '../../utils/dialog';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import './pd-indicator';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {connectStore} from '../../common/mixins/connect-store-mixin';
import {translate} from 'lit-translate';
import {
  AsyncAction,
  Disaggregation,
  IndicatorDialogData,
  LocationObject,
  Section,
  Indicator,
  Intervention
} from '@unicef-polymer/etools-types';

@customElement('pd-indicators')
export class PdIndicators extends connectStore(EnvironmentFlagsMixin(LitElement)) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          --blue-background: #b6d5f1;
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
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Boolean}) showInactiveIndicators!: boolean;

  /** On create/edit indicator only sections already saved on the intervention can be selected */
  set interventionSections(ids: string[]) {
    this.indicatorSectionOptions = filterByIds<Section>(this.sections, ids);
  }
  set interventionLocations(ids: string[]) {
    this.indicatorLocationOptions = filterByIds<LocationObject>(this.locations, ids);
  }

  private indicatorSectionOptions!: Section[];
  private indicatorLocationOptions!: LocationObject[];
  private interventionStatus!: string;

  protected render(): TemplateResult {
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host etools-data-table-row {
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
            align-items: stretch;
            padding-bottom: 0px;
            padding-top: 0px;
          }
        }
      </style>

      <div class="row-h align-items-center header">
        <div class="heading flex-auto">
          ${translate('INTERVENTION_RESULTS.PD_INDICATORS')}
          <iron-icon icon="add-box" @click="${() => this.openIndicatorDialog()}" ?hidden="${this.readonly}"></iron-icon>
        </div>
        <div class="heading number-data flex-none">${translate('INTERVENTION_RESULTS.BASELINE')}</div>
        <div class="heading number-data flex-none">${translate('INTERVENTION_RESULTS.TARGET')}</div>
      </div>

      ${this.indicators.map(
        (indicator: Indicator) => html`
          <pd-indicator
            .indicator="${indicator}"
            .disaggregations="${this.disaggregations}"
            .locationNames="${this.getLocationNames(indicator.locations)}"
            .sectionClusterNames="${this.getSectionAndCluster(indicator.section, indicator.cluster_name)}"
            .interventionStatus="${this.interventionStatus}"
            .readonly="${this.readonly}"
            ?hidden="${this._hideIndicator(indicator, this.showInactiveIndicators)}"
            ?cluster-indicator="${indicator.cluster_indicator_id}"
            ?high-frequency-indicator="${indicator.is_high_frequency}"
            @open-edit-indicator-dialog="${(e: CustomEvent) =>
              this.openIndicatorDialog(e.detail.indicator, e.detail.readonly)}"
            @open-deactivate-confirmation="${(e: CustomEvent) => this.openDeactivationDialog(e.detail.indicatorId)}"
            @open-delete-confirmation="${(e: CustomEvent) => this.openDeletionDialog(e.detail.indicatorId)}"
          ></pd-indicator>
        `
      )}
      ${!this.indicators.length
        ? html`
            <div class="layout-horizontal empty-row">
              <div class="text flex-auto">—</div>
              <div class="text number-data flex-none">—</div>
              <div class="text number-data flex-none">—</div>
            </div>
          `
        : ''}
    `;
  }

  stateChanged(state: RootState): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
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
    if (this.interventionStatus !== intervention.status) {
      this.interventionStatus = intervention.status;
    }
  }

  openIndicatorDialog(indicator?: Indicator, readonly?: boolean) {
    openDialog<IndicatorDialogData>({
      dialog: 'indicator-dialog',
      dialogData: {
        indicator: indicator ? cloneDeep(indicator) : null,
        sectionOptions: this.indicatorSectionOptions,
        locationOptions: this.indicatorLocationOptions,
        llResultId: this.pdOutputId,
        prpServerOn: this.prpServerIsOn()!,
        readonly: readonly
      }
    });
  }

  async openDeactivationDialog(indicatorId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: (translate('INTERVENTION_RESULTS.DEACTIVATE_PROMPT') as unknown) as string,
        confirmBtnText: (translate('INTERVENTION_RESULTS.DEACTIVATE') as unknown) as string
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
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention());
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  async openDeletionDialog(indicatorId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: (translate('INTERVENTION_RESULTS.DELETE_PROMPT') as unknown) as string,
        confirmBtnText: (translate('GENERAL.DELETE') as unknown) as string
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteIndicator(indicatorId);
    }
  }

  deleteIndicator(indicatorId: string) {
    const endpoint = getEndpoint(interventionEndpoints.getEditDeleteIndicator, {
      id: indicatorId
    });
    sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention());
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

  getLocationNames(ids: string[]): {name: string; adminLevel: string}[] {
    const locations = filterByIds<LocationObject>(this.locations, ids);
    const locNames = locations.map((l: any) => {
      return {
        name: l.name.substring(0, l.name.indexOf('[')),
        adminLevel: l.name.substring(l.name.indexOf('['))
      };
    });
    return locNames;
  }

  _hideIndicator(indicator: any, showInactiveIndicators: boolean) {
    if (!indicator.is_active) {
      return !showInactiveIndicators;
    }
    return false;
  }
}
