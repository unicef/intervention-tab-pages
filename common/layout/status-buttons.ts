import {customElement, html, LitElement, property, css} from 'lit-element';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-listbox/paper-listbox';
import {buttonsStyles} from '../../common/styles/button-styles';
import '../components/intervention/pd-termination';
import {PdTermination} from '../components/intervention/pd-termination';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';

/**
 * @customElement
 * @LitElement
 */
@customElement('status-buttons')
export class StatusButtons extends connect(getStore())(ComponentBaseMixin(LitElement)) {
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
    if (['terminated', 'closed', 'draft'].includes(this.activeStatus)) {
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

  private _terminationDialog!: PdTermination;

  _createTerminationDialog() {
    this._terminationDialog = document.createElement('pd-termination') as PdTermination;
    document.querySelector('body')!.appendChild(this._terminationDialog);

    this._terminationDialog.terminationElSource = this;
    this._setStatusTerminated();
  }

  _setStatusTerminated() {
    // this._terminationDialog.resetValidations();
    this._terminationDialog.interventionId = this.interventionId;
    this._terminationDialog.termination = {
      date: '',
      attachment_notice: 0
    };
    this._terminationDialog.dialogOpened = true;
  }
}
