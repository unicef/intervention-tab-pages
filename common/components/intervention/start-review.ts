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

/**
 * @LitElement
 * @customElement
 */
@customElement('start-review')
export class StartReview extends connectStore(LitElement) {
  @property() type = '';

  @property() reviewTypes: LabelAndValue[] = [];
  private PRC!: {label: string; value: string};
  private NON_PRC!: {label: string; value: string};
  private WITHOUT!: {label: string; value: string};

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

  connectedCallback(): void {
    // Initialization has to happen after the translation files were loaded
    this.PRC = {label: getTranslation('PRC_REVIEW'), value: PRC_REVIEW};
    this.NON_PRC = {label: getTranslation('NON_PRC_REVIEW'), value: NON_PRC_REVIEW};
    this.WITHOUT = {label: getTranslation('NO_REVIEW'), value: NO_REVIEW};
  }

  stateChanged(state: RootState) {
    this.reviewTypes = state.interventions?.current?.in_amendment
      ? [this.PRC, this.NON_PRC, this.WITHOUT]
      : [this.PRC, this.NON_PRC];
  }

  startReview(): void {
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: this.type
    });
  }
}
