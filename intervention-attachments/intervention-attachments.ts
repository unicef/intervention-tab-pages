import {LitElement, customElement, html} from 'lit-element';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-attachments')
export class InterventionAttachments extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      Attachments page
    `;
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
