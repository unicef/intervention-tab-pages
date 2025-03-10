import {LitElement, html, TemplateResult, CSSResultArray, css, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {RootState} from '../../common/types/store.types';
import './modals/indicator-dialog/indicator-dialog';
import get from 'lodash-es/get';
import {filterByIds} from '@unicef-polymer/etools-utils/dist/general.util';
import {isEmptyObject, isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import EnvironmentFlagsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/environment-flags-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getIntervention} from '../../common/actions/interventions';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import './pd-indicator';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {
  AsyncAction,
  Disaggregation,
  IndicatorDialogData,
  LocationObject,
  Section,
  Indicator,
  Intervention,
  EtoolsEndpoint
} from '@unicef-polymer/etools-types';
import {callClickOnSpacePushListener} from '@unicef-polymer/etools-utils/dist/accessibility.util';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

@customElement('pd-indicators')
export class PdIndicators extends connectStore(EnvironmentFlagsMixin(LitElement)) {
  @property({type: Array}) indicators: Indicator[] = [];
  @property() private locations: LocationObject[] = [];
  @property() private sections: Section[] = [];
  @property() private disaggregations: Disaggregation[] = [];
  @property() pdOutputId!: string;
  @property({type: Boolean}) readonly!: boolean;
  @property({type: Boolean}) showInactiveIndicators!: boolean;
  @property({type: Boolean}) inAmendment!: boolean;
  @property({type: String}) inAmendmentDate!: string;
  @property({type: Boolean}) lowResolutionLayout = false;

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
      ${sharedStyles}

      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-data-table-row .detailsOpened="${true}" id="indicatorsRow">
        <div slot="row-data" class="layout-horizontal align-items-center editable-row start-justified">
          <div class="title-text">${translate(translatesMap.applied_indicators)} (${this.indicators.length})</div>
          <etools-info-tooltip position="top" custom-icon ?hide-tooltip="${this.readonly}" offset="0">
            <etools-icon-button
              name="add-box"
              slot="custom-icon"
              class="add"
              @click="${() => this.openIndicatorDialog()}"
              ?hidden="${this.readonly}"
            ></etools-icon-button>
            <span class="no-wrap" slot="message">${translate('ADD_PD_INDICATOR')}</span>
          </etools-info-tooltip>
          <info-icon-tooltip
            id="iit-ind"
            .tooltipText="${translate('INDICATOR_TOOLTIP')}"
            ?hidden="${this.readonly}"
          ></info-icon-tooltip>
        </div>
        <div slot="row-data-details">
          <div
            class="table-row table-head align-items-center"
            ?hidden="${isEmptyObject(this.indicators) || this.lowResolutionLayout}"
          >
            <div class="flex-1 left-align">${translate('INDICATOR')}</div>
            <div class="flex-1 secondary-cell right">${translate('BASELINE')}</div>
            <div class="flex-1 secondary-cell right">${translate('TARGET')}</div>
          </div>
          ${this.indicators.length
            ? this.indicators.map(
                (indicator: Indicator, index: number) => html`
                  <pd-indicator
                    .index="${index}"
                    .indicator="${indicator}"
                    .disaggregations="${this.disaggregations}"
                    .locationNames="${this.getLocationNames(indicator.locations)}"
                    .sectionClusterNames="${this.getSectionAndCluster(indicator.section, indicator.cluster_name)}"
                    .interventionStatus="${this.interventionStatus}"
                    .readonly="${this.readonly}"
                    .inAmendment="${this.inAmendment}"
                    .inAmendmentDate="${this.inAmendmentDate}"
                    .lowResolutionLayout="${this.lowResolutionLayout}"
                    ?hidden="${this._hideIndicator(indicator, this.showInactiveIndicators)}"
                    @open-edit-indicator-dialog="${(e: CustomEvent) =>
                      this.openIndicatorDialog(e.detail.indicator, e.detail.readonly)}"
                    @open-deactivate-confirmation="${(e: CustomEvent) =>
                      this.openDeactivationDialog(e.detail.indicatorId)}"
                    @open-delete-confirmation="${(e: CustomEvent) => this.openDeletionDialog(e.detail.indicatorId)}"
                  ></pd-indicator>
                `
              )
            : html` <div class="table-row empty center-align">${translate('THERE_ARE_NO_PD_INDICATORS')}</div> `}
        </div>
      </etools-data-table-row>
    `;
  }

  stateChanged(state: RootState): void {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan) ||
      !state.interventions.current
    ) {
      return;
    }
    this.sections = (state.commonData && state.commonData.sections) || [];
    this.locations = (state.commonData && state.commonData.locations) || [];
    this.disaggregations = (state.commonData && state.commonData.disaggregations) || [];
    /**
     * Computing here to avoid recomputation on every open indicator dialog
     */
    this.computeAvailableOptionsForIndicators(get(state, 'interventions.current') as Intervention);
    this.envFlagsStateChanged(state);
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.shadowRoot!.querySelectorAll('#view-toggle-button, etools-icon-button').forEach((el) =>
      callClickOnSpacePushListener(el)
    );
  }

  openAllRows(): void {
    const row: EtoolsDataTableRow = this.shadowRoot!.querySelector('etools-data-table-row') as EtoolsDataTableRow;
    row.detailsOpened = true;
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
    if (!this.indicatorSectionOptions?.length && !this.indicatorLocationOptions?.length) {
      fireEvent(this, 'toast', {text: getTranslation('PLS_SELECT_SECTIONS_AND_LOCATIONS_FIRST')});
      return;
    }

    if (!this.indicatorSectionOptions?.length) {
      fireEvent(this, 'toast', {text: getTranslation('PLS_SELECT_SECTIONS_FIRST')});
      return;
    }

    if (!this.indicatorLocationOptions?.length) {
      fireEvent(this, 'toast', {text: getTranslation('PLS_SELECT_LOCATIONS_FIRST')});
      return;
    }
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
        content: translate('DEACTIVATE_PROMPT') as unknown as string,
        confirmBtnText: translate('DEACTIVATE') as unknown as string
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deactivateIndicator(indicatorId);
    }
  }

  deactivateIndicator(indicatorId: string) {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.getEditDeleteIndicator, {
      id: indicatorId
    });
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-indicator-deactivate'
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
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-indicator-deactivate'
        })
      );
  }

  async openDeletionDialog(indicatorId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('DELETE_PROMPT') as unknown as string,
        confirmBtnText: translate('GENERAL.DELETE') as unknown as string
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteIndicator(indicatorId);
    }
  }

  deleteIndicator(indicatorId: string) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-indicator-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.getEditDeleteIndicator, {
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
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-indicator-remove'
        })
      );
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
        name: l.name.substring(0, l.name.indexOf('[') == -1 ? l.name.indexOf('(') : l.name.indexOf('[')),
        adminLevel: l.name.substring(l.name.indexOf('[') == -1 ? l.name.indexOf('(') : l.name.indexOf('['))
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

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      ResultStructureStyles,
      ActivitiesAndIndicatorsStyles,
      css`
        :host {
          --main-background: #e1edd3;
          --main-background-dark: #e1edd3;
          display: block;
          background: var(--main-background);
        }
        .table-row:not(.empty) {
          min-height: 42px;
          padding-inline-end: 10% !important;
        }
        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          border-bottom: none;
        }
        info-icon-tooltip {
          margin-inline-start: 10px;
        }
        etools-data-table-row#indicatorsRow::part(edt-list-row-wrapper) {
          padding-inline-start: 25px !important;
        }
        etools-data-table-row#indicatorsRow::part(edt-list-row-collapse-wrapper) {
          border-top: none;
        }
      `
    ];
  }
}
