import {LitElement, html, property, customElement, query} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';
import {AnyObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import RepeatableDataSetsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/repeatable-data-sets-mixin';

/**
 * @customElement
 */
@customElement('update-fr-numbers')
export class UpdateFrNumbers extends RepeatableDataSetsMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    // ${repeatableDataSetsStyles}
    return html`
      ${sharedStyles}
      <style>
        :host {
          --paper-dialog-scrollable: {
            width: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            max-height: 400px;
            padding: 0;
            margin-top: -20px;
            box-sizing: border-box;
          }
        }

        paper-input {
          width: 250px;
        }

        .item-container .item-content > * {
          padding-inline: 24px 0;
          padding-block: 0 16px;
        }
        .item-actions-container {
          display: flex;
          flex-direction: row;
        }
        .item-actions-container .actions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-wrap: wrap;
        }
        .item-container .item-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          margin-inline-start: 10px;
          border-inline-start: 1px solid var(--darker-divider-color);
        }
        .action.delete {
          color: var(--error-color);
        }
      </style>

      <etools-dialog
        id="frsDialog"
        size="md"
        dialog-title=${translate('ADD_UPDATE_FR_NUMBERS')}
        ok-btn-text=${translate('GENERAL.ADD_UPDATE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ?disable-confirm-btn="${this.disableConfirmBtn}"
        @confirm-btn-clicked="${() => this._checkFrNumbers()}"
        no-padding
        keep-dialog-open
        spinner-text="Checking FR Numbers updates..."
      >
        ${(this.data || []).map(
          (item: AnyObject, index: number) => html`
            <div class="row-h item-container">
              <div class="item-actions-container">
                <div class="actions">
                  <paper-icon-button
                    class="action delete"
                    @click="${(event: CustomEvent) => this._openDeleteConfirmation(event, index)}"
                    .data-args="${index}"
                    icon="cancel"
                    ?hidden="${!this._showDeleteFrBtn(this.interventionStatus, this.data.length)}"
                  >
                  </paper-icon-button>
                </div>
              </div>
              <div class="item-content">
                <div class="row-h">
                  <!-- FR Number -->
                  <paper-input
                    .id="fr-nr-${index}"
                    label=${translate('FR_NUMBER')}
                    .value="${item.fr_number}"
                    placeholder="&#8212;"
                    allowed-pattern="[0-9]"
                    required
                    error-message=${translate('FILL_FR_NUMBER')}
                    @value-changed="${({detail}: CustomEvent) => this._frNrValueChanged(item, detail)}"
                  >
                  </paper-input>
                </div>
              </div>
            </div>
          `
        )}

        <div class="${(this.data || []).length ? 'hidden' : 'row-h'}">${translate('NO_FUND_RESERVATIONS_ADDED')}</div>

        <div class="row-h">
          <paper-button class="secondary-btn" @click="${() => this._addNewFundReservation()}">
            <iron-icon icon="add"></iron-icon>
            ${translate('ADD_FR_NUM')}
          </paper-button>
        </div>
      </etools-dialog>
    `;
  }

  @property() dialogOpened = true;

  @property({type: Boolean})
  editMode = true;

  @property({type: String})
  deleteConfirmationMessage = translate('DELETE_FR_PROMPT') as unknown as string;

  @property({type: Boolean})
  disableConfirmBtn = true;

  @property({type: String})
  interventionStatus!: string;

  @query('#frsDialog')
  frsDialog!: EtoolsDialog;

  _showDeleteFrBtn(interventionStatus: string, dataItemsLength: number) {
    return !(interventionStatus === 'active' && dataItemsLength === 1);
  }

  openDialog() {
    this.frsDialog.opened = true;
  }

  stopSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    this.frsDialog.stopSpinner();
  }

  startSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    this.frsDialog.startSpinner();
  }

  closeDialog() {
    this.stopSpinner();
    this.frsDialog.opened = false;
  }

  validate() {
    let valid = true;
    if (this.data instanceof Array && this.data.length > 0) {
      this.data.forEach((_item, index) => {
        const lastItem = this.shadowRoot!.querySelector('#fr-nr-' + index) as PaperInputElement;
        if (lastItem && !lastItem.validate()) {
          valid = false;
        }
      });
    }

    return valid;
  }

  _addNewFundReservation() {
    if (!this.validate()) {
      return;
    }
    this.data.push({fr_number: ''});
    this.data = [...this.data];
    setTimeout(this._centerDialog.bind(this), 0);
    setTimeout(this._updateScroll.bind(this), 100);
  }

  _centerDialog() {
    const d = this._getPaperDialog();
    if (d) {
      d.center();
    }
  }

  _updateScroll() {
    this.frsDialog.scrollDown();
  }

  _getPaperDialog() {
    return this.frsDialog.shadowRoot!.querySelector('paper-dialog') as PaperDialogElement;
  }

  _frNrValueChanged(item: AnyObject, detail: AnyObject) {
    item.fr_number = detail.value;
    this.disableConfirmBtn = !this.validate();
  }

  _checkFrNumbers() {
    if (!this.validate()) {
      return;
    }
    // resend fr number changes back to main fund reservations element
    fireEvent(this, 'update-frs-dialog-close', {
      frs: this._getUpdatedFrsNumbers()
    });
  }

  // prepare the fr numbers list, used to verify them using API endpoint (/api/v2/funds/frs)
  _getUpdatedFrsNumbers() {
    if (this.data instanceof Array && this.data.length > 0) {
      return this.data.map((item) => {
        return item.fr_number;
      });
    }
    return [];
  }
}
