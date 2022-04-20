import {customElement, html, LitElement, property} from 'lit-element';
import {EditorTableStyles} from './editor-utils/editor-table-styles';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@polymer/paper-input/paper-textarea';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {TABS} from '../common/constants';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
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
import {updateSmallMenu} from '../../../../../redux/actions/app';
import {RootState} from '../common/types/store.types';
import {EditorHoverStyles} from './editor-utils/editor-hover-styles';

@customElement('editor-table')
// @ts-ignore
export class EditorTable extends CommentsMixin(ActivitiesMixin(ArrowsNavigationMixin(LitElement))) {
  static get styles() {
    return [EditorTableStyles, EditorTableArrowKeysStyles, EditorHoverStyles];
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
          --iron-autogrow-textarea: {
            overflow: auto;
            padding: 0;
            max-height: 96px;
          }
          --paper-input-container-label-floating_-_font-weight: 600;
          --paper-font-subhead_-_font-weight: 600;
          --paper-input-container-label-floating {
            font-weight: 600;
          }
        }
        paper-textarea[readonly] {
          --iron-autogrow-textarea_-_overflow: hidden;
        }
      </style>
      <table>
        ${repeat(
          this.resultStructureDetails,
          (result: ExpectedResult) => result.id,
          (result, resultIndex) => html`
            <tbody hoverable class="heavy-blue">
              <tr class="header" ?hidden="${!this.isUnicefUser}">
                <td>${translate('ID')}</td>
                <td colspan="3">${translate('COUNTRY_PROGRAME_OUTPUT')}</td>
                <td colspan="3"></td>
                <td colspan="2">${translate('TOTAL')}</td>
              </tr>
              <tr class="text no-b-border" ?hidden="${!this.isUnicefUser}">
                <td>${result.code}</td>
                <td colspan="3" class="b">${result.cp_output_name}</td>
                <td colspan="3"></td>
                <td colspan="2">
                  ${this.intervention.planned_budget.currency}
                  <span class="b">${displayCurrencyAmount(result.total, '0.00')}</span>
                </td>
              </tr>
              <tr class="add action-btns" type="cp-output">
                <td></td>
                <td colspan="3"></td>
                <td colspan="3"></td>
                <td colspan="2" class="action-btns" tabindex="0">
                  <div
                    class="icon action-btns"
                    @click="${() => this.addNewPDOutput(result.ll_results)}"
                    ?hidden="${!this.permissions.edit.result_links}"
                  >
                    <paper-icon-button icon="add-box" tabindex="0"></paper-icon-button>
                  </div>
                </td>
              </tr>
            </tbody>
            ${repeat(
              result.ll_results,
              (pdOutput: ResultLinkLowerResultExtended) => pdOutput.id,
              (pdOutput: ResultLinkLowerResultExtended, pdOutputIndex) => html`
                <tbody
                  hoverable
                  class="lighter-blue"
                  comment-element="pd-output-${pdOutput.id}"
                  comment-description=" PD Output - ${pdOutput.name}"
                  ?in-edit-mode="${pdOutput.inEditMode}"
                >
                  <tr class="header">
                    <td></td>
                    <td colspan="3">${translate('PD_OUTPUT')}</td>
                    <td colspan="3"></td>
                    <td colspan="2">${translate('TOTAL')}</td>
                  </tr>
                  <tr class="text action-btns" type="pd-output">
                    <td class="padd-top-15">${pdOutput.code}</td>
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
                    <td
                      colspan="2"
                      class="action-btns"
                      style="position:relative;"
                      tabindex="${!this.permissions.edit.result_links ? '-1' : '0'}"
                    >
                      <div>
                        ${this.intervention.planned_budget.currency}
                        <span class="b">${displayCurrencyAmount(pdOutput.total, '0.00')}</span>
                      </div>
                      <div class="action-btns align-bottom">
                        <paper-icon-button
                          icon="create"
                          ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                          @click="${() => {
                            pdOutput.inEditMode = true;
                            this.requestUpdate();
                          }}"
                        ></paper-icon-button>
                        <div
                          class="icon"
                          @click="${() => this.addNewActivity(pdOutput)}"
                          ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                        >
                          <paper-icon-button icon="add-box"></paper-icon-button>
                        </div>
                        <paper-icon-button
                          icon="delete"
                          ?hidden="${pdOutput.inEditMode || !this.permissions.edit.result_links}"
                          @click="${() => this.openDeletePdOutputDialog(pdOutput.id)}"
                        ></paper-icon-button>
                      </div>
                      <div class="flex-h justify-right align-bottom" ?hidden="${!pdOutput.inEditMode}">
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
    if (!state.app?.smallMenu) {
      getStore().dispatch(updateSmallMenu(true));
    }
    this.interventionId = selectInterventionId(state);
    this.permissions = selectResultLinksPermissions(state);

    this.interventionStatus = selectInterventionStatus(state);
    this.quarters = selectInterventionQuarters(state);
    this.isUnicefUser = isUnicefUser(state);
    this.intervention = cloneDeep(currentIntervention(state));

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
