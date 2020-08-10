import {LitElement, html, property, customElement} from 'lit-element';

import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {removeDialog, createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';

import FrNumbersConsistencyMixin from '../../common/mixins/fr-numbers-consistency-mixin';
import {FrsDetails, Fr, Intervention} from '../../common/models/intervention.types';
import {customIcons} from '../../common/styles/custom-icons';
import {frWarningsStyles} from '../../common/styles/fr-warnings-styles';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import './update-fr-numbers';
import {UpdateFrNumbers} from './update-fr-numbers';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {getEndpoint} from '../../utils/endpoint-helper';
import {getArraysDiff} from '../../utils/array-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {AnyObject} from '../../common/models/globals.types';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '../../utils/fire-custom-event';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {patchIntervention} from '../../common/actions';
import {isJsonStrMatch} from '../../utils/utils';
import {FundReservationsPermissions} from './fund-reservations.models';
import {Permission} from '../../common/models/intervention.types';
import {selectFundReservationPermissions} from './fund-reservations.selectors';

/**
 * @customElement
 */
@customElement('fund-reservations')
export class FundReservations extends connect(getStore())(FrNumbersConsistencyMixin(LitElement)) {
  static get styles() {
    return [frWarningsStyles];
  }

  render() {
    if (!this.intervention) {
      return html`<etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${customIcons}
      <style>
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          --ecp-content-padding: 0;
          margin-bottom: 24px;
        }

        #frs-container {
          padding: 16px 0;
        }

        .fr-number {
          padding: 8px 12px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .warning {
          padding: 24px;
        }

        .warning,
        .fr-number {
          line-height: 24px;
        }
      </style>

      <etools-content-panel panel-title="Fund Reservations">
        <paper-icon-button
          slot="panel-btns"
          icon="add"
          @tap="${() => this._openFrsDialog()}"
          ?hidden="${!this.permissions.edit.frs}"
        ></paper-icon-button>
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
            <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
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
  frsConfirmationsDialog!: EtoolsDialog;

  @property({type: Object})
  _lastFrsDetailsReceived!: FrsDetails | null;

  @property({type: String})
  _frsConsistencyWarning!: string | boolean;

  private _frsConfirmationsDialogMessage!: HTMLSpanElement;

  stateChanged(state: AnyObject) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }
    const currentIntervention = get(state, 'interventions.current');
    if (currentIntervention && !isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this._frsDetailsChanged(this.intervention.frs_details);
    }
    this.sePermissions(state);
  }

  private sePermissions(state: any) {
    const newPermissions = selectFundReservationPermissions(state);
    if (!isJsonStrMatch(this.permissions, newPermissions)) {
      this.permissions = newPermissions;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._createFrsDialogEl();
    this._createFrsConfirmationsDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // remove update frs el on fr el detached
    this._removeFrsDialogEl();

    // remove confirmations frs dialog on fr element detached
    this._removeFrsConfirmationsDialog();
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

  _createFrsConfirmationsDialog() {
    // init frs confirmations dialog element
    this._frsConfirmationsDialogMessage = document.createElement('span');
    this._frsConfirmationsDialogMessage.setAttribute('id', 'frsConfirmationsDialogMessage');

    this._frsInconsistenciesConfirmationHandler = this._frsInconsistenciesConfirmationHandler.bind(this);
    this.frsConfirmationsDialog = createDynamicDialog({
      title: 'Fund Reservation Warning',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: this._frsInconsistenciesConfirmationHandler,
      content: this._frsConfirmationsDialogMessage
    });
  }

  _removeFrsConfirmationsDialog() {
    if (this.frsConfirmationsDialog) {
      this.frsConfirmationsDialog.removeEventListener('close', this._frsInconsistenciesConfirmationHandler as any);
      removeDialog(this.frsConfirmationsDialog);
    }
  }

  _updateFrsInconsistenciesDialogMessage(warning: string) {
    if (!this.frsConfirmationsDialog) {
      return;
    }
    if (this._frsConfirmationsDialogMessage) {
      this._frsConfirmationsDialogMessage.innerHTML = warning + '<br><br>Do you want to continue?';
    } else {
      logWarn('frsConfirmationsDialogMessage element not found', 'Fund Reservations');
    }
  }

  _openFrsDialog() {
    // populate dialog with current frs numbers deep copy
    const currentFrs = this._getCurrentFrs();
    const frs = currentFrs.map((fr: Fr) => {
      return {fr_number: fr.fr_number};
    });

    this.frsDialogEl.dataItems = frs;
    this.frsDialogEl.interventionStatus = this.intervention.status;
    this.frsDialogEl.openDialog();
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
  _frsInconsistenciesConfirmationHandler(e: CustomEvent) {
    e.stopImmediatePropagation();

    if (e.detail.confirmed) {
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

    let url = getEndpoint(interventionEndpoints.frNumbersDetails).url + '?values=' + frNumbers.join(',');
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

      this._updateFrsInconsistenciesDialogMessage(inconsistencyMsg);
      this._openFrsInconsistenciesDialog();
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
    const toastMsg =
      responseErr && responseErr.error ? responseErr.error : 'Can not add/update FR numbers. Please try again later!';
    // show the invalid frs warning
    fireEvent(this, 'toast', {
      text: toastMsg,
      showCloseBtn: true
    });
  }

  // trigger FR Numbers update on main intervention
  _triggerPdFrsUpdate(newFrsDetails: FrsDetails) {
    const frsIDs = (newFrsDetails.frs || []).map((fr) => fr.id);
    this.frsDialogEl.closeDialog();
    getStore().dispatch(patchIntervention({frs: frsIDs}));
  }

  thereAreFrs(_frsDetails: any) {
    const frs = this._getCurrentFrs();
    return !!frs.length;
  }

  _openFrsInconsistenciesDialog() {
    if (this.frsConfirmationsDialog) {
      this.frsConfirmationsDialog.opened = true;
      this.frsDialogEl.closeDialog();
    }
  }

  _getNoFrsWarningText(interventionId: string) {
    let msg = 'There are no fund reservations numbers added.';
    if (!interventionId) {
      msg = 'You can not add FR Numbers. The PD/SSFA needs to be saved first.';
    }
    return msg;
  }

  _frsDetailsChanged(frsDetails: FrsDetails) {
    if (typeof frsDetails === 'undefined') {
      return;
    }
    setTimeout(() => {
      this._frsConsistencyWarning = this.checkFrsConsistency(frsDetails, this.intervention);
    }, 100);
  }
}
