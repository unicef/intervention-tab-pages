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
import {getIntervention, updateCurrentIntervention} from '../common/actions/interventions';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {ActivitiesMixin} from './editor-utils/activities-mixin';
import {CommentsMixin} from '../common/components/comments/comments-mixin';
import {ExpectedResultExtended, ResultLinkLowerResultExtended} from './editor-utils/types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate/directives/translate';
import {AsyncAction} from '@unicef-polymer/etools-types';
import {EditorTableArrowKeysStyles} from './editor-utils/editor-table-arrow-keys-styles';
import {ArrowsNavigationMixin} from './editor-utils/arrows-navigation-mixin';

@customElement('editor-table')
export class EditorTable extends CommentsMixin(ActivitiesMixin(ArrowsNavigationMixin(LitElement))) {
  static get styles() {
    return [EditorTableStyles, EditorTableArrowKeysStyles];
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
            <thead ?hidden="${!this.isUnicefUser}">
              <tr class="edit blue">
                <td class="first-col"></td>
                <td colspan="3"></td>
                <td colspan="3"></td>
                <td class="last-col" colspan="2"></td>
              </tr>
              <tr class="header blue">
                <td>${translate('ID')}</td>
                <td colspan="3">${translate('COUNTRY_PROGRAME_OUTPUT')}</td>
                <td colspan="3"></td>
                <td colspan="2">${translate('TOTAL')}</td>
              </tr>
            </thead>
            <tbody>
              <tr class="text blue" ?hidden="${!this.isUnicefUser}">
                <td>${result.code}</td>
                <td colspan="3" class="b">${result.cp_output_name}</td>
                <td colspan="3"></td>
                <td colspan="2">
                  ${this.intervention.planned_budget.currency}
                  <span class="b">${displayCurrencyAmount(result.total, '0.00')}</span>
                </td>
              </tr>
              <tr class="add blue" type="cp-output">
                <td></td>
                <td colspan="3" tabindex="0">
                  <div class="icon" @click="${() => this.addNewPDOutput(result.ll_results)}">
                    <paper-icon-button
                      icon="add-box"
                      tabindex="0"
                      ?hidden="${!this.permissions.edit.result_links}"
                    ></paper-icon-button>
                    ${translate('ADD_NEW_PD_OUTPUT')}
                  </div>
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
                    <td class="last-col" colspan="2">
                      <paper-icon-button
                        icon="create"
                        ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                        @click="${() => {
                          pdOutput.inEditMode = true;
                          this.requestUpdate();
                        }}"
                      ></paper-icon-button>
                      <paper-icon-button
                        icon="delete"
                        ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                        @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                      ></paper-icon-button>
                    </td>
                  </tr>
                  <tr class="header">
                    <td></td>
                    <td colspan="3">${translate('PD_OUTPUT')}</td>
                    <td colspan="3"></td>
                    <td colspan="2">${translate('TOTAL')}</td>
                  </tr>
                </thead>
                <tbody
                  class="gray-1"
                  comment-element="pd-output-${pdOutput.id}"
                  comment-description=" PD Output - ${pdOutput.name}"
                >
                  <tr class="text" type="pd-output">
                    <td>${pdOutput.code}</td>
                    <td colspan="3" class="b" tabindex="0">
                      <paper-textarea
                        no-label-float
                        input
                        .value="${pdOutput.name}"
                        ?readonly="${!pdOutput.inEditMode}"
                        required
                        .invalid="${pdOutput.invalid}"
                        error-message="${translate('THIS_FIELD_IS_REQUIRED')}"
                        @keydown="${(e: any) => this.handleEsc(e)}"
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
                  <tr class="add" type="pd-output">
                    <td></td>
                    <td
                      colspan="3"
                      tabindex="${pdOutput.inEditMode || !this.permissions.edit.result_links ? '-1' : '0'}"
                    >
                      <div
                        class="icon"
                        @click="${() => this.addNewActivity(pdOutput)}"
                        ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                      >
                        <paper-icon-button icon="add-box"></paper-icon-button>
                        ${translate('ADD_NEW_ACTIVITY')}
                      </div>
                    </td>
                    <td colspan="3"></td>
                    <td class="h-center" colspan="2">
                      <div class="flex-h justify-right" ?hidden="${!pdOutput.inEditMode}">
                        <paper-button @click="${() => this.savePdOutput(pdOutput, result.cp_output)}"
                          >${translate('GENERAL.SAVE')}</paper-button
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

  private lastFocusedTd: any = null;
  private refreshResultStructure = false;
  private prevInterventionId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    setTimeout(() => {
      this.addArrowNavListener();
      this.focusFirstTd();
    }, 2000);
  }

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
    if (this.lastFocusedTd) {
      this.lastFocusedTd.focus();
    }
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
    if (!llResults.find((ll) => !ll.id)) {
      llResults.unshift({name: '', total: '0', inEditMode: true});
      this.requestUpdate();
    }
  }

  addNewActivity(pdOutput: Partial<ResultLinkLowerResultExtended>) {
    if (!pdOutput.activities?.find((a) => !a.id)) {
      // @ts-ignore
      pdOutput.activities?.unshift({name: '', total: '0', time_frames: [], inEditMode: true});
      this.requestUpdate();
    }
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

  async openDeletePdOutputDialog(lower_result_id: number) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('REMOVE_PD_MSG'),
        confirmBtnText: translate('CONFIRM_BTN_TXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deletePDOutputFromPD(lower_result_id);
    }
  }

  deletePDOutputFromPD(lower_result_id: number) {
    const endpoint = getEndpoint(interventionEndpoints.lowerResultsDelete, {
      lower_result_id,
      intervention_id: this.interventionId
    });
    sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    }).then(() => {
      this.getResultLinksDetails();
      getStore().dispatch<AsyncAction>(getIntervention());
    });
  }

  updateModelValue(model: any, property: string, newVal: any) {
    if (newVal == model[property]) {
      return;
    }
    model[property] = newVal;
    this.requestUpdate();
  }
}
