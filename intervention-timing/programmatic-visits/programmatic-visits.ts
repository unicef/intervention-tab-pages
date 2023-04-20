import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import isEmpty from 'lodash-es/isEmpty';
import {RootState} from '../../common/types/store.types';
import {PlannedVisitsPermissions} from './programmaticVisits.models';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {selectPlannedVisits, selectPlannedVisitsPermissions} from './programmaticVisits.selectors';
import {selectInterventionDates} from '../intervention-dates/interventionDates.selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {getIntervention, patchIntervention} from '../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, Intervention, Permission, Site} from '@unicef-polymer/etools-types';
import {PlannedVisit} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import RepeatableDataSetsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/repeatable-data-sets-mixin';
import {repeatableDataSetsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/repeatable-data-sets-styles';
import {getEndpoint as getEndpointHelper} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import '../../common/components/sites-widget/sites-dialog';
import './pv-quarter';

/**
 * @customElement
 */
@customElement('programmatic-visits')
export class ProgrammaticVisits extends CommentsMixin(ComponentBaseMixin(RepeatableDataSetsMixin(LitElement))) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    if (!this.data) {
      return html` ${sharedStyles}
        <etools-loading source="pv" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        ${repeatableDataSetsStyles} :host {
          display: block;
          margin-bottom: 24px;
        }

        div.col-1 {
          min-width: 100px;
        }

        div.col-1.yearContainer {
          min-width: 110px;
          padding-inline-start: 16px;
          padding-top: 10px;
        }

        .error-msg {
          color: var(--error-color);
          font-size: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .padd-left-when-items {
          margin-inline-start: 46px;
        }

        .secondary-btn {
          --paper-button: {
            color: #0099ff;
          }
        }
        .totalContainer {
          text-align: center;
          height: 114px;
          font-weight: bold;
        }
        .bgColor {
          background-color: #0099ff29;
        }
        p {
          margin-top: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }

        .separator {
          width: 5px;
          height: 114px;
          border-inline-end: 1px solid #979797;
          margin-inline-end: 30px;
        }
        .total-lbl {
          font-size: 14px;
          padding-top: 15px;
          padding-bottom: 15px;
        }
        paper-button iron-icon {
          margin-inline-start: 45px;
          margin-inline-end: 10px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('PROGRAMATIC_VISITS')}
        comment-element="programmatic-visits"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v extra-top-padd" ?hidden="${!this.editMode}">
          <paper-button
            class="secondary-btn ${this._getAddBtnPadding(this.data?.length)}"
            @click="${this._addNewPlannedVisit}"
          >
            <iron-icon icon="add-box"></iron-icon>
            ${translate('ADD_YEAR')}
          </paper-button>
        </div>

        <div class="pv-container">${this.renderVisitsTemplate(this.data)}</div>

        <div ?hidden="${!isEmpty(this.data)}">
          <p>${translate('NO_PLANNED_VISITS')}</p>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: any;

  @property({type: Array})
  years: AnyObject[] = [];

  @property({type: String})
  interventionStatus!: string;

  @property({type: Object})
  permissions!: Permission<PlannedVisitsPermissions>;

  @property({type: Array})
  data!: PlannedVisit[];

  @property({type: String})
  _deleteEpName = interventionEndpoints.interventionPVDelete;

  @property({type: Object})
  extraEndpointParams!: AnyObject;

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  currentCountry!: AnyObject;

  @property({type: Array})
  allSites!: Site[];

  @property({type: Object})
  getEndpoint = getEndpointHelper; // Used in RepeatableDataSetsMixin

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('delete-confirm', this.afterItemDeleted.bind(this) as any);
    this.addEventListener('visits-number-change', this.recalculateTotal.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-confirm', this.afterItemDeleted.bind(this) as any);
  }

  recalculateTotal() {
    this.data = [...this.data];
  }

  afterItemDeleted() {
    getStore().dispatch<AsyncAction>(getIntervention());
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    this.intervention = cloneDeep(state.interventions.current);
    this.populateVisits(state);
    this.permissions = selectPlannedVisitsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    this.interventionStatus = state.interventions.current.status;
    this.extraEndpointParams = {intervention_id: state.interventions.current.id};
    this.currentCountry = get(state, 'user.data.country') as any;
    if (!isJsonStrMatch(this.allSites, state.commonData!.sites)) {
      this.allSites = [...state.commonData!.sites];
    }
    super.stateChanged(state);
  }

  populateVisits(state: any) {
    const planned_visits = selectPlannedVisits(state).planned_visits;
    if (!isJsonStrMatch(this.originalData, planned_visits)) {
      const auxData = cloneDeep(planned_visits);
      auxData.forEach((item) => {
        item.quarterIntervals = this.setQuartersIntervals(Number(item.year)!);
      });

      this.data = auxData;
      this.originalData = cloneDeep(this.data);
    }
    const interventionDates = selectInterventionDates(state);
    this._setYears(interventionDates.start, interventionDates.end);
  }

  setQuartersIntervals(year: number) {
    return [
      '01 Jan ' + year + ' - ' + '31 Mar ' + year,
      '01 April ' + year + ' - ' + '30 June ' + year,
      '01 July ' + year + ' - ' + '30 Sept ' + year,
      '01 Oct ' + year + ' - ' + '31 Dec ' + year
    ];
  }

  _plannedVisitsChanged(planned_visits: any) {
    if (!Array.isArray(planned_visits)) {
      this.data = [];
    }
  }

  _setYears(interventionStart: string, interventionEnd: string) {
    if (interventionStart === null || interventionEnd === null) {
      return;
    }
    if (interventionStart !== '' && interventionEnd !== '') {
      let start = parseInt(interventionStart.substring(0, 4), 10);
      const end = parseInt(interventionEnd.substring(0, 4), 10) + 1;
      const years = this.data.filter((pv) => pv.year).map((pv) => Number(pv.year));
      while (start <= end) {
        years.push(start);
        start++;
      }
      this.years = [...new Set(years)]
        .sort((a, b) => a - b)
        .map((year) => ({
          value: year,
          label: year
        }));
    } else {
      this.years = [];
    }
  }

  renderVisitsTemplate(planned_visits: any) {
    if (isEmpty(planned_visits)) {
      return html``;
    }
    return html`
      ${planned_visits?.map(
        (item: PlannedVisit, index: number) => html`
          <div class="layout-horizontal">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button
                  class="action delete"
                  @click="${(event: CustomEvent) => this._openDeleteConfirmation(event, index)}"
                  data-args="${index}"
                  ?disabled="${!this._canBeRemoved(index, this.editMode)}"
                  icon="cancel"
                >
                </paper-icon-button>
              </div>
            </div>
            <div class="col-1 yearContainer">
              <etools-dropdown
                .id="year_${index}"
                class="year"
                label=${translate('YEAR')}
                placeholder="&#8212;"
                .selected="${item.year}"
                .options="${this.years}"
                ?required=${this.editMode}
                error-message=${translate('GENERAL.REQUIRED_FIELD')}
                trigger-value-change-event
                @etools-selected-item-changed="${(e: CustomEvent) => this._yearChanged(e, index)}"
                ?readonly="${!this.editMode}"
                auto-validate
              >
              </etools-dropdown>
            </div>
          </div>
          <div class="row-padding-h">
            <div class="row-h layout-wrap">
              <pv-quarter
                qIndex="1"
                .item="${item}"
                .currentCountry="${this.currentCountry}"
                .allSites="${this.allSites}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.planned_visits)}"
                ?required="${item.year && this.editMode}"
              ></pv-quarter>
              <div class="separator"></div>
              <pv-quarter
                qIndex="2"
                .item="${item}"
                .currentCountry="${this.currentCountry}"
                .allSites="${this.allSites}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.planned_visits)}"
                ?required="${item.year && this.editMode}"
              ></pv-quarter>
              <div class="separator"></div>
              <pv-quarter
                qIndex="3"
                .item="${item}"
                .currentCountry="${this.currentCountry}"
                .allSites="${this.allSites}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.planned_visits)}"
                ?required="${item.year && this.editMode}"
              ></pv-quarter>
              <div class="separator"></div>
              <pv-quarter
                qIndex="4"
                .item="${item}"
                .currentCountry="${this.currentCountry}"
                .allSites="${this.allSites}"
                ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.planned_visits)}"
                ?required="${item.year && this.editMode}"
              ></pv-quarter>
              <div class="separator"></div>
              <div class="col-1 totalContainer bgColor">
                <div class="total-lbl">${translate('GENERAL.TOTAL_C')} ${item.year}</div>
                <div>
                  ${this._getTotal(
                    item.programmatic_q1,
                    item.programmatic_q2,
                    item.programmatic_q3,
                    item.programmatic_q4
                  )}
                </div>
                <div>${translate('VISITS')}</div>
              </div>
              <div
                class="col flex-c"
                ?hidden="${this._showErrMsg(
                  item.year!,
                  item.programmatic_q1,
                  item.programmatic_q2,
                  item.programmatic_q3,
                  item.programmatic_q4
                )}"
              >
                <div class="error-msg">${translate('TOTAL_ERR')}</div>
              </div>
            </div>
          </div>
        `
      )}
    `;
  }

  /**
   * The planned visit row data can be removed only if (intervention status is new or draft) or (if it doesn't have
   * and id assigned(only if is not saved))
   */
  _canBeRemoved(index: number, editMode: boolean) {
    if (!editMode || !this.data || !this.data.length || !this.data[index]) {
      return false;
    }
    const plannedVisit = this.data[index];
    const plannedVisitId = Number(plannedVisit.id);
    return this._isDraft() || !(plannedVisitId && isNaN(plannedVisitId) === false && plannedVisitId > 0);
  }

  _isDraft() {
    return this.interventionStatus === '' || this.interventionStatus === 'draft';
  }

  _yearChanged(event: CustomEvent, index: number) {
    const selectedItem = event.detail.selectedItem ? event.detail.selectedItem : null;
    if (!selectedItem) {
      return;
    }
    const yearSelected = selectedItem.value;

    if (this.isAlreadySelected(yearSelected, index, 'year')) {
      fireEvent(this, 'toast', {
        text: getTranslation('YEAR_SELECTED_ERR')
      });
      this._clearSelectedYear(index);
    }
    this.data[index]['year'] = yearSelected;
    this.data[index].quarterIntervals = this.setQuartersIntervals(yearSelected);
    this.data[index] = {...this.data[index]};
    this.data = [...this.data];
  }

  /**
   * Timeout because yearDropdown.selected is set after the execution of _yearChanged method
   */
  _clearSelectedYear(index: number) {
    this.data[index].year = null;
    this.data = [...this.data];
    // backup reset because the above doesn't seem to work
    this.shadowRoot!.querySelector<EtoolsDropdownEl>('#year_' + index)!.selected = null;
  }

  _getTotal(q1: string | number, q2: string | number, q3: string | number, q4: string | number) {
    return (Number(q1) || 0) + (Number(q2) || 0) + (Number(q3) || 0) + (Number(q4) || 0);
  }

  _showErrMsg(
    year: string | number,
    q1: string | number,
    q2: string | number,
    q3: string | number,
    q4: string | number
  ) {
    return year && this._getTotal(q1, q2, q3, q4) > 0;
  }

  validate() {
    let valid = true;
    this.data?.forEach((item: any, index: number) => {
      if (
        !this._validateYear(index) ||
        !this._getTotal(item.programmatic_q1, item.programmatic_q2, item.programmatic_q3, item.programmatic_q4)
      ) {
        valid = false;
      }
    });

    return valid;
  }

  _validateYear(index: number) {
    let valid = true;
    const yearEl = this.shadowRoot!.querySelector('#year_' + index) as EtoolsDropdownEl;

    if (yearEl && !yearEl.validate()) {
      valid = false;
    }
    return valid;
  }

  /**
   * Validate last added planned visit and if is not empty add a new one
   */
  _addNewPlannedVisit() {
    if (!this.validate()) {
      fireEvent(this, 'toast', {
        text: getTranslation('ALREADY_ADDED_PLANNED_VISIT')
      });
      return;
    }
    this.data = [...this.data, new PlannedVisit()];
  }

  _getAddBtnPadding(itemsLength: number) {
    return (!itemsLength ? '' : 'padd-left-when-items') + ' planned-visits';
  }

  _getNoPVMsgPadding(itemsLength: number) {
    return !itemsLength && this.editMode ? 'no-top-padd' : '';
  }
  saveData() {
    if (!this.validate()) {
      fireEvent(this, 'toast', {
        text: getTranslation('FIX_VALIDATION_ERRORS')
      });
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention({planned_visits: this.cleanUpData(this.data)}))
      .then(() => {
        this.editMode = false;
      });
  }

  cleanUpData(data: PlannedVisit[]) {
    const dataToSave = cloneDeep(data);
    // @ts-ignore
    delete dataToSave.quarterIntervals;
    dataToSave.forEach((p: PlannedVisit) => {
      // @ts-ignore
      p.programmatic_q1_sites = p.programmatic_q1_sites.map((s: any) => s.id);
      // @ts-ignore
      p.programmatic_q2_sites = p.programmatic_q2_sites.map((s: any) => s.id);
      // @ts-ignore
      p.programmatic_q3_sites = p.programmatic_q3_sites.map((s: any) => s.id);
      // @ts-ignore
      p.programmatic_q4_sites = p.programmatic_q4_sites.map((s: any) => s.id);
    });

    return dataToSave;
  }
}
