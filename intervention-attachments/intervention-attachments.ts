import {LitElement, customElement, html} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './attachments-list/attachments-list';
import './prc-document/prc-document';
/**
 * @customElement
 */
@customElement('intervention-attachments')
export class InterventionAttachments extends LitElement {
  render() {
    // language=HTML
    return html` <style></style>
      <attachments-list></attachments-list>
      <prc-document></prc-document>`;
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
