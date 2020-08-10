import {LitElement, html, property, customElement} from 'lit-element';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {repeatableDataSetsStyles} from '../../common/styles/repeatable-data-sets-styles';
import isEmpty from 'lodash-es/isEmpty';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {layoutCenterJustified, layoutVertical} from '../../common/styles/flex-layout-styles';
import {AnyObject} from '../../common/models/globals.types';
import {PlannedVisits, PlannedVisitsPermissions} from './programmaticVisits.models';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {selectPlannedVisits, selectPlannedVisitsPermissions} from './programmaticVisits.selectors';
import {Permission, PlannedVisit, PlannedBudget} from '../../common/models/intervention.types';
import {selectInterventionDates} from '../../intervention-timing/intervention-dates/interventionDates.selectors';
import cloneDeep from 'lodash-es/cloneDeep';
import {patchIntervention} from '../../common/actions';
import RepeatableDataSetsMixin from '../../common/mixins/repeatable-data-sets-mixin';

/**
 * @customElement
 */
@customElement('programmatic-visits')
export class ProgrammaticVisits extends connect(getStore())(ComponentBaseMixin(RepeatableDataSetsMixin(LitElement))) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    if (!this.data) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} ${repeatableDataSetsStyles}
        :host {
          display: block;
          margin-bottom: 24px;
        }

        div.col-1 {
          min-width: 85px;
        }

        div.col-1.yearContainer {
          min-width: 100px;
        }

        .error-msg {
          color: var(--error-color);
          font-size: 12px;
          ${layoutVertical}
          ${layoutCenterJustified}
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
      </style>

      <etools-content-panel show-expand-btn panel-title="Programmatic Visits">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          ${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}
        </div>

        <div class="row-h extra-top-padd" ?hidden="${!this.editMode}">
          <paper-button
            class="secondary-btn ${this._getAddBtnPadding(this.data?.length)}"
            @tap="${this._addNewPlannedVisit}"
          >
            ADD YEAR
          </paper-button>
        </div>

        <div class="pv-container">
          ${this.renderVisitsTemplate(this.data)}
        </div>

        <div
          .class="row-h ${this._getNoPVMsgPadding(this.data?.length)}"
          ?hidden="${!this._emptyList(this.data?.length)}"
        >
          <p>There are no planned visits added.</p>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  originalData!: any;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  years: AnyObject[] = [];

  @property({type: String})
  interventionStatus!: string;

  @property({type: Object})
  permissions!: Permission<PlannedVisitsPermissions>;

  @property({type: Array})
  data!: PlannedVisit[];

  connectedCallback() {
    super.connectedCallback();
    this._createDeleteConfirmationDialog();
  }

  stateChanged(state: any) {
    if (!state.interventions.current) {
      return;
    }
    this.populateVisits(state);
    this.permissions = selectPlannedVisitsPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  populateVisits(state: any) {
    this.data = selectPlannedVisits(state).planned_visits;
    this.originalData = cloneDeep(this.data);
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
      let start = parseInt(interventionStart.substr(0, 4), 10);
      const end = parseInt(interventionEnd.substr(0, 4), 10) + 1;
      const years = [];
      while (start <= end) {
        years.push({
          value: start,
          label: start
        });
        start++;
      }
      this.years = years;
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
                  @tap="${(event: CustomEvent) => this._openDeleteConfirmation(event, index)}"
                  data-args="${index}"
                  ?disabled="${!this._canBeRemoved(index, this.editMode)}"
                  icon="cancel"
                >
                </paper-icon-button>
              </div>
            </div>
            <div class="item-content">
              <div class="row-h">
                <div class="col col-1 yearContainer">
                  <etools-dropdown
                    .id="year_${index}"
                    class="year"
                    label="Year"
                    placeholder="&#8212;"
                    .selected="${item.year}"
                    .options="${this.years}"
                    required
                    error-message="Required"
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
                    label="Quarter 1"
                    .value="${item.programmatic_q1}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year}"
                    error-message="Required"
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q1')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q2"
                    label="Quarter 2"
                    .value="${item.programmatic_q2}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year}"
                    error-message="Required"
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q2')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q3"
                    label="Quarter 3"
                    .value="${item.programmatic_q3}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year}"
                    error-message="Required"
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q3')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input
                    .id="visit_${index}_q4"
                    label="Quarter 4"
                    .value="${item.programmatic_q4}"
                    type="number"
                    min="0"
                    allowed-pattern="[0-9.]"
                    placeholder="&#8212;"
                    ?required="${item.year}"
                    error-message="Required"
                    auto-validate
                    @value-changed="${(e: CustomEvent) => this.inputChanged(e, index, 'q4')}"
                    ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.planned_visits)}"
                  >
                  </paper-input>
                </div>
                <div class="col col-1 totalContainer">
                  <paper-input
                    id="totalComp"
                    label="TOTAL"
                    readonly
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
                  <div class="error-msg">Total has to be greater than 0</div>
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
    const plannedVisitId = parseInt(plannedVisit.id, 10);
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
        text: 'Year already selected on other planned visit item.',
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
        text: 'Already added planned visit data is not valid yet',
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

  cancel() {
    this.originalData = cloneDeep(this.originalData);
    this.editMode = false;
  }

  save() {
    if (!this.validate()) {
      return;
    }
    getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
