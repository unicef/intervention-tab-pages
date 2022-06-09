import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import isEmpty from 'lodash-es/isEmpty';
import {RootState} from '../../common/types/store.types';
import {PlannedVisitsPermissions} from './programmaticVisits.models';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {selectPlannedVisits, selectPlannedVisitsPermissions} from './programmaticVisits.selectors';
import {selectInterventionDates} from '../intervention-dates/interventionDates.selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {patchIntervention} from '../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {PlannedVisit} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import RepeatableDataSetsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/repeatable-data-sets-mixin';
import {repeatableDataSetsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/repeatable-data-sets-styles';
import {getEndpoint as getEndpointHelper} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';

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
        <etools-loading source="pv" loading-text="Loading..." active></etools-loading>`;
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
        }

        .error-msg {
          color: var(--error-color);
          font-size: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .padd-left-when-items {
          margin-left: 46px;
        }

        .secondary-btn {
          --paper-button: {
            color: #0099ff;
          }
        }
        .totalContainer {
          text-align: center;
        }
        p {
          margin-top: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('PROGRAMATIC_VISITS')}
        comment-element="programmatic-visits"
        comment-description=${translate('PROGRAMATIC_VISITS')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-h extra-top-padd" ?hidden="${!this.editMode}">
          <paper-button
            class="secondary-btn ${this._getAddBtnPadding(this.data?.length)}"
            @click="${this._addNewPlannedVisit}"
          >
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
  getEndpoint = getEndpointHelper;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    this.populateVisits(state);
    this.permissions = selectPlannedVisitsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
    this.interventionStatus = state.interventions.current.status;
    this.extraEndpointParams = {intervention_id: state.interventions.current.id};
    super.stateChanged(state);
  }

  populateVisits(state: any) {
    const planned_visits = selectPlannedVisits(state).planned_visits;
    if (!isJsonStrMatch(this.originalData, planned_visits)) {
      this.data = planned_visits;
      this.originalData = cloneDeep(this.data);
    }
    const interventionDates = selectInterventionDates(state);
    this._setYears(interventionDates.start, interventionDates.end);
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
          <div class="row-h item-container">
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
            <div class="item-content">
              <div class="row-h layout-wrap">
                <div class="col col-1 yearContainer">
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
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q1"
                    label=${translate('QUARTER_1')}
                    .value="${item.programmatic_q1}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year && this.editMode}"
                    error-message=${translate('GENERAL.REQUIRED_FIELD')}
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q1')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q2"
                    label=${translate('QUARTER_2')}
                    .value="${item.programmatic_q2}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year && this.editMode}"
                    error-message=${translate('GENERAL.REQUIRED_FIELD')}
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q2')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q3"
                    label=${translate('QUARTER_3')}
                    .value="${item.programmatic_q3}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year && this.editMode}"
                    error-message=${translate('GENERAL.REQUIRED_FIELD')}
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q3')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q4"
                    label=${translate('QUARTER_4')}
                    .value="${item.programmatic_q4}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year && this.editMode}"
                    error-message=${translate('GENERAL.REQUIRED_FIELD')}
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q4')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1 totalContainer">
                  <paper-input
                    id="totalComp"
                    label=${translate('GENERAL.TOTAL_C')}
                    readonly
                    tabindex="-1"
                    class="row-second-bg"
                    no-placeholder
                    .value="${this._getTotal(
                      item.programmatic_q1,
                      item.programmatic_q2,
                      item.programmatic_q3,
                      item.programmatic_q4
                    )}"
                  ></paper-input>
                </div>
                <div
                  class="col col-4"
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
          </div>
        `
      )}
    `;
  }

  inputChanged(e: CustomEvent, index: number, qIndex: string) {
    if (!e.detail) {
      return;
    }

    this.data[index]['programmatic_' + qIndex] = e.detail.value;
    this.data = [...this.data];
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
        text: getTranslation('YEAR_SELECTED_ERR'),
        showCloseBtn: true
      });
      this._clearSelectedYear(index);
    }
    this.data[index]['year'] = yearSelected;
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

  _getTotal(q1: string, q2: string, q3: string, q4: string) {
    return (Number(q1) || 0) + (Number(q2) || 0) + (Number(q3) || 0) + (Number(q4) || 0);
  }

  _showErrMsg(year: string, q1: string, q2: string, q3: string, q4: string) {
    return year && this._getTotal(q1, q2, q3, q4) > 0;
  }

  validate() {
    let valid = true;
    this.data?.forEach((item: any, index: number) => {
      if (!(this._validateYear(index) && this._validateQuarters(item, index))) {
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

  _validateQuarters(item: any, index: number) {
    let valid = true;
    const q1 = this.shadowRoot!.querySelector('#visit_' + index + '_q1') as PaperInputElement;
    const q2 = this.shadowRoot!.querySelector('#visit_' + index + '_q2') as PaperInputElement;
    const q3 = this.shadowRoot!.querySelector('#visit_' + index + '_q3') as PaperInputElement;
    const q4 = this.shadowRoot!.querySelector('#visit_' + index + '_q4') as PaperInputElement;

    [q1, q2, q3, q4].forEach(function (q) {
      if (q) {
        if (!q.validate()) {
          valid = false;
        }
      }
    });
    if (!this._getTotal(item.programmatic_q1, item.programmatic_q2, item.programmatic_q3, item.programmatic_q4)) {
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
        text: getTranslation('ALREADY_ADDED_PLANNED_VISIT'),
        showCloseBtn: true
      });
      return;
    }
    this.data = [...this.data, new PlannedVisit()];
    // this._addElement();
  }

  _getAddBtnPadding(itemsLength: number) {
    return (!itemsLength ? '' : 'padd-left-when-items') + ' planned-visits';
  }

  _getNoPVMsgPadding(itemsLength: number) {
    return !itemsLength && this.editMode ? 'no-top-padd' : '';
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch<AsyncAction>(patchIntervention({planned_visits: this.data}))
      .then(() => {
        this.editMode = false;
      });
  }
}
