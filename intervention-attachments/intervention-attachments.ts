import {LitElement, customElement, html} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import './attachments-list/attachments-list';
import './prc-document/prc-document';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
/**
 * @customElement
 */
@customElement('intervention-attachments')
export class InterventionAttachments extends LitElement {
  private isEPDApp = ROOT_PATH === '/epd/';

  render() {
    // language=HTML
    return html` <style></style>
      <attachments-list></attachments-list>
      ${!this.isEPDApp ? html`<prc-document></prc-document>` : ``}`;
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }
}
