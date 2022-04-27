import {CSSResultArray, customElement, html, LitElement, property, TemplateResult} from 'lit-element';
import '@unicef-polymer/etools-currency-amount-input';
import '@polymer/paper-input/paper-textarea';
import '@polymer/paper-toggle-button';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '../../intervention-workplan/results-structure/modals/activity-dialog/activity-timeframes';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
// eslint-disable-next-line
import {ActivityTimeFrames} from '../../intervention-workplan/results-structure/modals/activity-dialog/activity-timeframes';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

@customElement('time-intervals-dialog')
export class TimeIntervalsDialog extends LitElement {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }
  @property() dialogOpened = true;
  @property() readonly: boolean | undefined = false;
  @property() selectedTimeFrames: number[] = [];
  quarters: ActivityTimeFrames[] = [];

  set dialogData({quarters, readonly, selectedTimeFrames}: any) {
    this.quarters = quarters;
    this.readonly = readonly;
    this.selectedTimeFrames = selectedTimeFrames;
  }

  protected render(): TemplateResult {
    // language=html
    return html`
      ${sharedStyles}
      <style>
        .container {
          padding: 12px 24px;
        }
      </style>

      <etools-dialog
        size="lg"
        keep-dialog-open
        ?opened="${this.dialogOpened}"
        dialog-title=${this.readonly ? translate('ACTIVITY_TIMES_READONLY') : translate('ACTIVITY_TIMES')}
        @confirm-btn-clicked="${() => this.onClose(this.selectedTimeFrames)}"
        @close="${() => this.onClose()}"
        ok-btn-text=${translate('SELECT')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        .hideConfirmBtn="${this.readonly}"
        no-padding
      >
        <div class="container layout vertical">
          <activity-time-frames
            hide-label
            .quarters="${this.quarters}"
            .selectedTimeFrames="${this.selectedTimeFrames || []}"
            .readonly="${this.readonly}"
            @time-frames-changed="${({detail}: CustomEvent) => (this.selectedTimeFrames = detail)}"
          ></activity-time-frames>
        </div>
      </etools-dialog>
    `;
  }

  onClose(timeFrames?: number[]): void {
    fireEvent(this, 'dialog-closed', {confirmed: Boolean(timeFrames), response: timeFrames});
  }
}
