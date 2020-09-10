import {LitElement, customElement, html} from 'lit-element';
import {fireEvent} from '../utils/fire-custom-event';
import './attachments-list';

/**
 * @customElement
 */
@customElement('intervention-attachments')
export class InterventionAttachments extends LitElement {
  render() {
    // language=HTML
    return html`<attachments-list></attachments-list>`;
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
