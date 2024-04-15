import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-utils/dist/fire-event.util';
import {
  validateRequiredFields,
  resetRequiredFields
} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from 'lit-translate';
import {NO_REVIEW, NON_PRC_REVIEW, PRC_REVIEW} from './review.const';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {RootState} from '../../types/store.types';
import {get as getTranslation} from 'lit-translate';

/**
 * @LitElement
 * @customElement
 */
@customElement('start-review')
export class StartReview extends connectStore(LitElement) {
  @property() type = '';

  @property() reviewTypes: LabelAndValue[] = [];

  PRC = {label: getTranslation('PRC_REVIEW'), value: PRC_REVIEW};
  NON_PRC = {label: getTranslation('NON_PRC_REVIEW'), value: NON_PRC_REVIEW};
  WITHOUT = {label: getTranslation('NO_REVIEW'), value: NO_REVIEW};

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
            required
            @focus="${() => resetRequiredFields(this)}"
            @click="${() => resetRequiredFields(this)}"
          ></etools-dropdown>
        </div>
      </etools-dialog>
    `;
  }

  stateChanged(state: RootState) {
    this.reviewTypes = state.interventions?.current?.in_amendment
      ? [this.PRC, this.NON_PRC, this.WITHOUT]
      : [this.PRC, this.NON_PRC];
  }

  startReview(): void {
    if (!validateRequiredFields(this)) {
      return;
    }
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: this.type
    });
  }
}
