import {LitElement, html, property, customElement, query} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-dialog/etools-dialog';
import RepeatableDataSetsMixin from '../../common/mixins/repeatable-data-sets-mixin';
import {fireEvent} from '../../utils/fire-custom-event';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {PaperDialogElement} from '@polymer/paper-dialog/paper-dialog';
import {AnyObject} from '../../common/models/globals.types';
import {
  layoutVertical,
  layoutFlex,
  layoutCenterJustified,
  layoutWrap,
  layoutHorizontal
} from '../../common/styles/flex-layout-styles';

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
      <style>
        ${sharedStyles} :host {
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
          padding: 0 0 16px 24px;
        }
        .item-actions-container {
          ${layoutHorizontal}
        }
        .item-actions-container .actions {
          ${layoutVertical}
          ${layoutCenterJustified}
          ${layoutWrap}
        }
        .item-container .item-content {
          ${layoutVertical}
          ${layoutFlex}
          margin-left: 10px;
          border-left: 1px solid var(--darker-divider-color);
        }
        .action.delete {
          color: var(--error-color);
        }
      </style>

      <etools-dialog
        id="frsDialog"
        size="md"
        dialog-title="Add/Update FR Numbers"
        ok-btn-text="Add/Update"
        ?disable-confirm-btn="${this.disableConfirmBtn}"
        @confirm-btn-clicked="${() => this._checkFrNumbers()}"
        no-padding
        keep-dialog-open
        spinner-text="Checking FR Numbers updates..."
      >
        ${(this.dataItems || []).map(
          (item: AnyObject, index: number) => html`
            <div class="row-h item-container">
              <div class="item-actions-container">
                <div class="actions">
                  <paper-icon-button
                    class="action delete"
                    @tap="${() => this._openDeleteConfirmation(index)}"
                    .data-args="${index}"
                    icon="cancel"
                    ?hidden="${!this._showDeleteFrBtn(this.interventionStatus, this.dataItems.length)}"
                  >
                  </paper-icon-button>
                </div>
              </div>
              <div class="item-content">
                <div class="row-h">
                  <!-- FR Number -->
                  <paper-input
                    .id="fr-nr-${index}"
                    label="FR Number"
                    .value="${item.fr_number}"
                    placeholder="&#8212;"
                    allowed-pattern="[0-9]"
                    required
                    error-message="Please fill FR Number or remove the field"
                    @value-changed="${({detail}: CustomEvent) => this._frNrValueChanged(item, detail)}"
                  >
                  </paper-input>
                </div>
              </div>
            </div>
          `
        )}

        <div class="${(this.dataItems || []).length ? 'hidden' : 'row-h'}">
          There are no fund reservations numbers added.
        </div>

        <div class="row-h">
          <paper-button class="secondary-btn" @tap="${() => this._addNewFundReservation()}">
            <iron-icon icon="add"></iron-icon>
            Add FR Number
          </paper-button>
        </div>
      </etools-dialog>
    `;
  }

  @property() dialogOpened = true;

  @property({type: Boolean})
  editMode = true;

  @property({type: String})
  deleteConfirmationMessage = 'Are you sure you want to delete this FR Number?';

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
    if (this.dataItems instanceof Array && this.dataItems.length > 0) {
      this.dataItems.forEach((_item, index) => {
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
    this.dataItems.push({fr_number: ''});
    this.dataItems = [...this.dataItems];
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
    if (this.dataItems instanceof Array && this.dataItems.length > 0) {
      return this.dataItems.map((item) => {
        return item.fr_number;
      });
    }
    return [];
  }
}
