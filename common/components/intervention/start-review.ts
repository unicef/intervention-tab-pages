import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown';
import '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {NO_REVIEW, NON_PRC_REVIEW, PRC_REVIEW} from '../../../intervention-review/review.const';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../types/store.types';
import {get as getTranslation} from 'lit-translate';

const PRC = {label: getTranslation('PRC_REVIEW'), value: PRC_REVIEW};
const NON_PRC = {label: getTranslation('NON_PRC_REVIEW'), value: NON_PRC_REVIEW};
const WITHOUT = {label: getTranslation('NO_REVIEW'), value: NO_REVIEW};
/**
 * @LitElement
 * @customElement
 */
@customElement('start-review')
export class StartReview extends connectStore(LitElement) {
  @property() type = '';

  @property() reviewTypes: LabelAndValue[] = [];

  render() {
    return html`
      ${sharedStyles}
      <style>
        .row {
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
        dialog-title="${translate('SEND_FOR_REVIEW')}"
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
