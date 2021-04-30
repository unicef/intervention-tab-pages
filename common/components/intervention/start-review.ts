import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown';
import '../../styles/shared-styles-lit';
import {sharedStyles} from '../../styles/shared-styles-lit';
import {fireEvent} from '../../../utils/fire-custom-event';
import {translate} from 'lit-translate';
import {NON_PRC_REVIEW, PRC_REVIEW, REVIEW_TYPES} from '../../../intervention-review/review.const';

/**
 * @LitElement
 * @customElement
 */
@customElement('start-review')
export class StartReview extends LitElement {
  @property() type = '';
  @property() reviewTypes = [
    {label: REVIEW_TYPES.get(PRC_REVIEW), value: PRC_REVIEW},
    {label: REVIEW_TYPES.get(NON_PRC_REVIEW), value: NON_PRC_REVIEW}
  ];

  render() {
    return html`
      <style>
        ${sharedStyles} .row {
          padding: 0 24px;
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

  startReview(): void {
    fireEvent(this, 'dialog-closed', {
      confirmed: true,
      response: this.type
    });
  }
}
