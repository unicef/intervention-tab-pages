import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown';
import '../../styles/shared-styles-lit';
import {sharedStyles} from '../../styles/shared-styles-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {translate} from 'lit-translate';
import {NO_REVIEW, NON_PRC_REVIEW, PRC_REVIEW, REVIEW_TYPES} from '../../../intervention-review/review.const';
import {connectStore} from '../../mixins/connect-store-mixin';
import {RootState} from '../../types/store.types';

const PRC = {label: REVIEW_TYPES.get(PRC_REVIEW), value: PRC_REVIEW};
const NON_PRC = {label: REVIEW_TYPES.get(NON_PRC_REVIEW), value: NON_PRC_REVIEW};
const WITHOUT = {label: REVIEW_TYPES.get(NO_REVIEW), value: NO_REVIEW};
/**
 * @LitElement
 * @customElement
 */
@customElement('start-review')
export class StartReview extends connectStore(LitElement) {
  @property() type = '';
  @property() reviewTypes = [];

  render() {
    return html`
      <style>
        ${sharedStyles} .row {
          padding: 12px 24px;
        }
        etools-dropdown {
          --esmm-external-wrapper_-_max-width: initial;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        opened
        size="md"
        ok-btn-text="${translate('START')}"
        dialog-title="${translate('START_REVIEW')}"
        @confirm-btn-clicked="${() => this.startReview()}"
      >
        <div class="row">
          <etools-dropdown
            label="${translate('REVIEW_TYPE')}"
            .selected="${this.type}"
            placeholder="&#8212;"
            .options="${this.reviewTypes}"
            trigger-value-change-event
            @etools-selected-item-changed="${({detail}: CustomEvent) => (this.type = detail.selectedItem?.value)}"
          ></etools-dropdown>
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: RootState) {
    this.reviewTypes = state.interventions?.current?.in_amendment ? [PRC, NON_PRC, WITHOUT] : [PRC, NON_PRC];
  }

  startReview(): void {
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: this.type
    });
  }
}
