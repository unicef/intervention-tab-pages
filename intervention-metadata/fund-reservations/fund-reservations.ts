import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import './update-fr-numbers';
import {UpdateFrNumbers} from './update-fr-numbers';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {RootState} from '../../common/types/store.types';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {patchIntervention} from '../../common/actions/interventions';
import {FundReservationsPermissions} from './fund-reservations.models';
import {selectFundReservationPermissions} from './fund-reservations.selectors';
import {isUnicefUser} from '../../common/selectors';
import {AnyObject, AsyncAction, EtoolsEndpoint, Permission} from '@unicef-polymer/etools-types';
import {Intervention, FrsDetails, Fr} from '@unicef-polymer/etools-types';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate, get as getTranslation} from 'lit-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import ContentPanelMixin from '@unicef-polymer/etools-modules-common/dist/mixins/content-panel-mixin';
import {getArraysDiff} from '@unicef-polymer/etools-utils/dist/array.util';
import {listenForLangChanged} from 'lit-translate';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 */
@customElement('fund-reservations')
export class FundReservations extends CommentsMixin(ContentPanelMixin(FrNumbersConsistencyMixin(LitElement))) {
  static get styles() {
    return [frWarningsStyles];
  }

  render() {
    if (!this.isUnicefUser) {
      return html``;
    }
    if (!this.intervention) {
      return html`<etools-loading source="fund-res" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        #frs-container {
          padding: 16px 0;
        }

        .fr-number {
          padding: 8px 12px;
          font-size: var(--etools-font-size-16, 16px);
          box-sizing: border-box;
        }

        .warning {
          padding: 32px 24px;
        }

        .warning,
        .fr-number {
          line-height: 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('FUND_RESERVATIONS')}
        comment-element="fund-reservations"
      >
        <etools-icon-button
          slot="panel-btns"
          name="add-box"
          @click="${() => this._openFrsDialog()}"
          ?hidden="${!this.permissions.edit.frs}"
        ></etools-icon-button>
        <div id="frs-container" ?hidden="${!this.thereAreFrs(this.intervention.frs_details)}">
          <etools-info-tooltip
            class="frs-inline-list"
            icon-first
            custom-icon
            .hideTooltip="${!this.frsConsistencyWarningIsActive(this._frsConsistencyWarning)}"
          >
            <div slot="field">
              ${this.intervention.frs_details.frs.map(
                (item: AnyObject) => html`<span class="fr-number">${item.fr_number}</span>`
              )}
            </div>
            <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
            <span slot="message"><span>${this._frsConsistencyWarning}</span></span>
          </etools-info-tooltip>
        </div>
        <div class="warning" ?hidden="${this.thereAreFrs(this.intervention.frs_details)}">
          ${this._getNoFrsWarningText(String(this.intervention.id))}
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<FundReservationsPermissions>;

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  frsDialogEl!: UpdateFrNumbers;

  @property({type: Object})
  _lastFrsDetailsReceived!: FrsDetails | null;

  @property({type: String})
  _frsConsistencyWarning!: string | boolean;

  @property({type: Boolean})
  isUnicefUser!: boolean;

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata') ||
      !state.interventions.current
    ) {
      return;
    }
    this.isUnicefUser = isUnicefUser(state);
    const currentIntervention = get(state, 'interventions.current');
    if (currentIntervention && !isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this._frsDetailsChanged(this.intervention.frs_details);
    }

    this.sePermissions(state);
    super.stateChanged(state);
  }

  private sePermissions(state: any) {
    const newPermissions = selectFundReservationPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.permissions = newPermissions;
    }
  }

  constructor() {
    super();
    listenForLangChanged(() => {
      this._frsDetailsChanged(this.intervention?.frs_details);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._createFrsDialogEl();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // remove update frs el on fr el detached
    this._removeFrsDialogEl();
  }

  _createFrsDialogEl() {
    // init frs update element
    this.frsDialogEl = document.createElement('update-fr-numbers') as UpdateFrNumbers;
    this.frsDialogEl.setAttribute('id', 'frNumbersUpdateEl');

    // attach frs update handler (on modal/dialog close)
    this.frNumbersUpdateHandler = this.frNumbersUpdateHandler.bind(this);
    this.frsDialogEl.addEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler as any);

    document.querySelector('body')!.appendChild(this.frsDialogEl);
  }

  _removeFrsDialogEl() {
    if (this.frsDialogEl) {
      this.frsDialogEl.removeEventListener('update-frs-dialog-close', this.frNumbersUpdateHandler as any);
      document.querySelector('body')!.removeChild(this.frsDialogEl);
    }
  }

  _openFrsDialog() {
    // populate dialog with current frs numbers deep copy
    const currentFrs = this._getCurrentFrs();
    const frs = currentFrs.map((fr: Fr) => {
      return {fr_number: fr.fr_number};
    });

    this.frsDialogEl.data = frs;
    this.frsDialogEl.interventionStatus = this.intervention.status;
    this.frsDialogEl.openDialog();
    this.openContentPanel();
  }

  // get original/initial intervention frs numbers
  _getCurrentFrs(): Fr[] {
    return this.intervention.frs_details && this.intervention.frs_details.frs instanceof Array
      ? this.intervention.frs_details.frs
      : [];
  }

  frNumbersUpdateHandler(e: CustomEvent) {
    e.stopImmediatePropagation();
    const frNumbers = e.detail.frs;
    if (frNumbers.length === 0) {
      this._handleEmptyFrsAfterUpdate();
      return;
    }
    // FR Numbers not empty
    this._handleNotEmptyFrsAfterUpdate(frNumbers);
  }

  /**
   * After FR Numbers update the numbers list might be empty.
   * This can happen if the user removed all the existing numbers or if there is no change made
   */
  _handleEmptyFrsAfterUpdate() {
    const frsBeforeUpdate = this._getCurrentFrs();
    if (frsBeforeUpdate.length !== 0) {
      // all FR Numbers have been deleted
      this._triggerPdFrsUpdate(new FrsDetails());
    }
  }

  /**
   * Updates made and FR Numbers list is not empty
   */
  _handleNotEmptyFrsAfterUpdate(frNumbers: string[]) {
    const diff = getArraysDiff(this._getCurrentFrs(), frNumbers, 'fr_number');
    if (!diff.length) {
      // no changes have been made to FR Numbers
      this.frsDialogEl.closeDialog();
    } else {
      // request FR Numbers details from server
      this._triggerFrsDetailsRequest(frNumbers);
    }
  }

  // handle frs validations warning confirmation
  _frsInconsistenciesConfirmationHandler(confirmed: boolean) {
    if (confirmed) {
      // confirmed, add numbers to intervention
      this._triggerPdFrsUpdate(Object.assign({}, this._lastFrsDetailsReceived));
      this._lastFrsDetailsReceived = null;
    } else {
      // frs warning not confirmed/cancelled, frs update is canceled
      // re-check frs warning on initial data
      this._frsDetailsChanged(this.intervention.frs_details);
    }
  }

  /**
   * Get FR Numbers details from server
   */
  _triggerFrsDetailsRequest(frNumbers: string[]) {
    (this.frsDialogEl as UpdateFrNumbers).startSpinner();

    let url =
      getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.frNumbersDetails).url +
      '?values=' +
      frNumbers.join(',');
    if (this.intervention.id) {
      url += '&intervention=' + this.intervention.id;
    }

    sendRequest({endpoint: {url: url}})
      .then((resp: FrsDetails) => {
        this._frsDetailsSuccessHandler(resp);
      })
      .catch((error: any) => {
        this._frsDetailsErrorHandler(error.response);
      });
  }

  /*
   * Frs details received, check frs consistency
   */
  _frsDetailsSuccessHandler(frsDetails: FrsDetails) {
    frsDetails.currencies_match = this._frsCurrenciesMatch(frsDetails.frs);

    const inconsistencyMsg = this.checkFrsConsistency(frsDetails, this.intervention, true);
    this._frsConsistencyWarning = inconsistencyMsg;

    if (inconsistencyMsg) {
      // there are inconsistencies
      this._lastFrsDetailsReceived = frsDetails;

      this._openFrsInconsistenciesDialog(inconsistencyMsg);
    } else {
      // append FR numbers to intervention
      this._triggerPdFrsUpdate(frsDetails);
    }
  }

  /**
   * frs details request failed
   */
  _frsDetailsErrorHandler(responseErr: any) {
    this.frsDialogEl.stopSpinner();
    let toastMsg =
      responseErr && responseErr.error
        ? responseErr.error
        : (getTranslation('ADD_UPDATE_FR_NUMBER_ERR') as unknown as string);
    if (toastMsg.includes('HTTPConnection')) {
      const index = toastMsg.indexOf('HTTPConnection');
      toastMsg = toastMsg.slice(0, index);
    }
    // show the invalid frs warning
    fireEvent(this, 'toast', {
      text: toastMsg
    });
  }

  // trigger FR Numbers update on main intervention
  _triggerPdFrsUpdate(newFrsDetails: FrsDetails) {
    const frsIDs = (newFrsDetails.frs || []).map((fr) => fr.id);
    this.frsDialogEl.closeDialog();
    getStore().dispatch<AsyncAction>(patchIntervention({frs: frsIDs}));
  }

  thereAreFrs(_frsDetails: any) {
    const frs = this._getCurrentFrs();
    return !!frs.length;
  }

  async _openFrsInconsistenciesDialog(inconsistencyMsg: string) {
    this.frsDialogEl.closeDialog();
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: html`${inconsistencyMsg} <br /><br />Do you want to continue?`,
        confirmBtnText: translate('YES')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
    this._frsInconsistenciesConfirmationHandler(confirmed);
  }

  _getNoFrsWarningText(interventionId: string) {
    let msg = translate('NO_FR_NUM_ADDED') as unknown as string;
    if (!interventionId) {
      msg = translate('CAN_NOT_ADD_FR_NUM') as unknown as string;
    }
    return msg;
  }

  _frsDetailsChanged(frsDetails: FrsDetails) {
    if (!frsDetails) {
      return;
    }
    setTimeout(() => {
      this._frsConsistencyWarning = this.checkFrsConsistency(frsDetails, this.intervention);
    }, 100);
  }
}
