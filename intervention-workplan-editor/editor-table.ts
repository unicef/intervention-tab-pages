import {customElement, html, LitElement, property} from 'lit-element';
import {EditorTableStyles} from './editor-utils/editor-table-styles';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {TABS} from '../common/constants';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {RootState} from '../../../../../redux/store';
import {
  selectInterventionId,
  selectInterventionQuarters,
  selectInterventionStatus,
  selectResultLinksPermissions
} from '../intervention-workplan/results-structure/results-structure.selectors';
import {currentIntervention, isUnicefUser} from '../common/selectors';
import {ExpectedResult, Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {InterventionQuarter} from '@unicef-polymer/etools-types/dist/intervention.types';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {repeat} from 'lit-html/directives/repeat';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@polymer/paper-button/paper-button';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {updateCurrentIntervention} from '../common/actions/interventions';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ActivitiesMixin} from './editor-utils/activities-mixin';
import {CommentsMixin} from '../common/components/comments/comments-mixin';
import {ExpectedResultExtended, ResultLinkLowerResultExtended} from './editor-utils/types';

@customElement('editor-table')
export class EditorTable extends CommentsMixin(ActivitiesMixin(LitElement)) {
  static get styles() {
    return [EditorTableStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        paper-textarea {
          outline: none;
          flex: auto;
          --paper-input-container-input: {
            display: block;
          }
        }
      </style>
      <table>
        ${repeat(
          this.resultStructureDetails,
          (result: ExpectedResult) => result.id,
          (result, resultIndex) => html`
            <thead>
              <tr class="edit blue">
                <td class="first-col"></td>
                <td colspan="3"></td>
                <td colspan="3"></td>
                <td class="col-6" colspan="2"></td>
              </tr>
              <tr class="header blue">
                <td>ID</td>
                <td colspan="3">Country Programme Output</td>
                <td colspan="3"></td>
                <td colspan="2">Total</td>
              </tr>
            </thead>
            <tbody>
              <tr class="text blue">
                <td>${result.code}</td>
                <td colspan="3" class="b">${result.cp_output_name}</td>
                <td colspan="3"></td>
                <td colspan="2">
                  ${this.intervention.planned_budget.currency}
                  <span class="b">${displayCurrencyAmount(result.total, '0.00')}</span>
                </td>
              </tr>
              <tr class="add blue">
                <td></td>
                <td colspan="3">
                  <paper-icon-button
                    icon="add-box"
                    ?hidden="${!this.permissions.edit.result_links}"
                    @click="${() => this.addNewPDOutput(result.ll_results)}"
                  ></paper-icon-button>
                  Add New PD Output
                </td>
                <td colspan="3"></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
            ${result.ll_results.map(
              (pdOutput: ResultLinkLowerResultExtended, pdOutputIndex) => html`
                <thead class="gray-1">
                  <tr class="edit">
                    <td class="first-col"></td>
                    <td colspan="3"></td>
                    <td colspan="3"></td>
                    <td class="col-6" colspan="2">
                      <paper-icon-button
                        icon="create"
                        ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                        @click="${() => {
                          pdOutput.inEditMode = true;
                          this.requestUpdate();
                        }}"
                      ></paper-icon-button>
                    </td>
                  </tr>
                  <tr class="header">
                    <td></td>
                    <td colspan="3">PD Output</td>
                    <td colspan="3"></td>
                    <td colspan="2">Total</td>
                  </tr>
                </thead>
                <tbody
                  class="gray-1"
                  comment-element="pd-output-${pdOutput.id}"
                  comment-description=" PD Output - ${pdOutput.name}"
                >
                  <tr class="text">
                    <td>${pdOutput.code}</td>
                    <td colspan="3" class="b">
                      <paper-textarea
                        no-label-float
                        .value="${pdOutput.name}"
                        ?readonly="${!pdOutput.inEditMode}"
                        required
                        .invalid="${pdOutput.invalid}"
                        error-message="This field is required"
                        @value-changed="${({detail}: CustomEvent) =>
                          this.updateModelValue(pdOutput, 'name', detail.value)}"
                      ></paper-textarea>
                    </td>
                    <td colspan="3"></td>
                    <td colspan="2">
                      ${this.intervention.planned_budget.currency}
                      <span class="b">${displayCurrencyAmount(pdOutput.total, '0.00')}</span>
                    </td>
                  </tr>
                  <tr class="add">
                    <td></td>
                    <td colspan="3">
                      <span ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                        ><paper-icon-button
                          icon="add-box"
                          @click="${() => this.addNewActivity(pdOutput)}"
                        ></paper-icon-button>
                        Add New Activity</span
                      >
                    </td>
                    <td colspan="3"></td>
                    <td class="h-center" colspan="2">
                      <div class="flex-h justify-right" ?hidden="${!pdOutput.inEditMode}">
                        <paper-button @click="${() => this.savePdOutput(pdOutput, result.cp_output)}"
                          >Save</paper-button
                        >
                        <paper-icon-button
                          icon="close"
                          @click="${() => this.cancelPdOutput(result.ll_results, pdOutput, resultIndex, pdOutputIndex)}"
                        ></paper-icon-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
                ${this.renderActivities(pdOutput, resultIndex, pdOutputIndex)}
              `
            )}
          `
        )}
      </table>
    `;
  }

  private _resultStructureDetails: ExpectedResultExtended[] = [];
  @property({type: Array})
  get resultStructureDetails(): ExpectedResultExtended[] {
    return this._resultStructureDetails || [];
  }
  set resultStructureDetails(data: ExpectedResultExtended[]) {
    // data.forEach((r) => {
    //   r.ll_results = r.ll_results.sort((a, b) => Number(b.id) - Number(a.id));
    //   r.ll_results.forEach((l) => (l.activities = l.activities.sort((a, b) => Number(b.id) - Number(a.id))));
    // });
    this._resultStructureDetails = data.sort((a, b) => Number(Boolean(b.id)) - Number(Boolean(a.id)));
  }
  @property() interventionId!: number | null;
  @property() interventionStatus!: string;

  quarters: InterventionQuarter[] = [];
  originalResultStructureDetails: ExpectedResultExtended[] = [];

  @property({type: Boolean}) isUnicefUser = true;
  @property({type: Object})
  permissions!: {
    edit: {result_links?: boolean};
    required: {result_links?: boolean};
  };

  // @property() private _resultLinks: ExpectedResult[] | null = [];

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Boolean})
  readonly = false;

  private refreshResultStructure = false;
  private prevInterventionId: number | null = null;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(state.app?.routeDetails, 'interventions', TABS.WorkplanEditor)) {
      this.prevInterventionId = null;
      return;
    }
    if (!selectInterventionId(state)) {
      return;
    }
    this.interventionId = selectInterventionId(state);
    this.permissions = selectResultLinksPermissions(state);

    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));
    // this.resultLinks = selectInterventionResultLinks(state);

    if (this.prevInterventionId != selectInterventionId(state) || this.refreshResultStructure) {
      this.getResultLinksDetails();
      this.prevInterventionId = this.interventionId;
      this.refreshResultStructure = false;
    }
    super.stateChanged(state);
  }

  getResultLinksDetails() {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });
    sendRequest({endpoint: getEndpoint(interventionEndpoints.resultLinksDetails, {id: this.intervention.id})}).then(
      (response: any) => {
        this.resultStructureDetails = response.result_links;
        this.originalResultStructureDetails = cloneDeep(this.resultStructureDetails);
        this.requestUpdate();
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.localName
        });
      }
    );
  }

  addNewPDOutput(llResults: Partial<ResultLinkLowerResultExtended>[]) {
    llResults.unshift({name: '', total: '0', inEditMode: true});
    this.requestUpdate();
  }

  addNewActivity(pdOutput: Partial<ResultLinkLowerResultExtended>) {
    pdOutput.activities?.unshift({name: '', total: '0', time_frames: [], inEditMode: true});
    this.requestUpdate();
  }

  savePdOutput(pdOutput: ResultLinkLowerResultExtended, cpOutputId: number) {
    if (!this.validatePdOutput(pdOutput)) {
      pdOutput.invalid = true;
      this.requestUpdate();
      return;
    }

    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: this.localName
    });

    const endpoint: EtoolsRequestEndpoint = pdOutput.id
      ? getEndpoint(interventionEndpoints.pdOutputDetails, {pd_id: pdOutput.id, intervention_id: this.interventionId})
      : getEndpoint(interventionEndpoints.createPdOutput, {intervention_id: this.interventionId});

    sendRequest({
      endpoint,
      method: pdOutput.id ? 'PATCH' : 'POST',
      body: pdOutput.id
        ? {id: pdOutput.id, name: pdOutput.name, cp_output: cpOutputId}
        : {name: pdOutput.name, cp_output: cpOutputId}
    })
      .then((response) => {
        this.refreshResultStructure = true;
        getStore().dispatch(updateCurrentIntervention(response.intervention));
      })
      .then(() => {
        fireEvent(this, 'dialog-closed', {confirmed: true});
      })
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.localName
        })
      );
  }

  validatePdOutput(pdOutput: ResultLinkLowerResultExtended) {
    if (!pdOutput.name) {
      return false;
    }
    return true;
  }

  cancelPdOutput(
    llResults: Partial<ResultLinkLowerResultExtended>[],
    pdOutput: ResultLinkLowerResultExtended,
    resultIndex: number,
    pdOutputIndex: number
  ) {
    if (!pdOutput.id) {
      llResults.shift();
    } else {
      pdOutput.name = this.originalResultStructureDetails[resultIndex].ll_results[pdOutputIndex].name;
    }
    pdOutput.invalid = false;
    pdOutput.inEditMode = false;

    this.requestUpdate();
  }

  updateModelValue(model: any, property: string, newVal: any) {
    if (newVal == model[property]) {
      return;
    }
    model[property] = newVal;
    this.requestUpdate();
  }
}
