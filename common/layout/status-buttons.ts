import {customElement, html, LitElement, property, css, query} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-listbox/paper-listbox';
import {buttonsStyles} from '../../common/styles/button-styles';
import EtoolsDialog from '@unicef-polymer/etools-dialog';

/**
 * @customElement
 * @LitElement
 */
@customElement('status-buttons')
export class StatusButtons extends LitElement {
  static get styles() {
    return [
      buttonsStyles,
      css`
        paper-button.status {
          background-color: #009688;
        }
      `
    ];
  }
  public render() {
    if (['terminated', 'closed'].includes(this.activeStatus)) {
      return html``;
    } else {
      return html`
        <paper-button class="primary status" @tap=${this._setStatusTerminated}> Terminate PD </paper-button>
      `;
    }
  }

  @property({type: String})
  activeStatus!: string;

  @property({type: String})
  interventionId!: string;

  @query('#pdTermination')
  _terminationDialog!: EtoolsDialog & {resetValidations(): void};

  _createTerminationDialog() {
    this._terminationDialog = document.createElement('pd-termination') as any;
    document.querySelector('body')!.appendChild(this._terminationDialog);

    this._terminationDialog.set('terminationElSource', this);
  }

  _setStatusTerminated() {
    // this._terminationDialog.resetValidations();
    this._terminationDialog.set('interventionId', this.interventionId);
    this._terminationDialog.set('termination', {
      date: null,
      attachment_notice: null
    });
    this._terminationDialog.set('opened', true);
  }
}
