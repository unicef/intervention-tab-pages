import {customElement, html, LitElement, property, css} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-listbox/paper-listbox';
import {buttonsStyles} from '../../common/styles/button-styles';
import '../components/intervention/pd-termination';
import {openDialog} from '../../utils/dialog';

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
    if (['terminated', 'closed', 'draft', 'ended'].includes(this.activeStatus)) {
      return html``;
    } else {
      return html`
        <paper-button class="primary status" @tap=${this._createTerminationDialog}> Terminate PD </paper-button>
      `;
    }
  }

  @property({type: String})
  activeStatus!: string;

  interventionId!: number;

  _createTerminationDialog() {
    // this._terminationDialog = document.createElement('pd-termination') as PdTermination;
    // document.querySelector('body')!.appendChild(this._terminationDialog);
    openDialog({
      dialog: 'pd-termination',
      dialogData: {
        interventionId: this.interventionId,
      }
    });
  }
}
