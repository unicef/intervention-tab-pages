import {LitElement, html} from 'lit-element';
import './partner-details/partner-info';
import './document-details/document-details';
import './details-overview/details-overview';
import './unicef-details/unicef-details';
import './gender-equity-rating/gender-equity-rating';
import './geographical-coverage/geographical-coverage';
import './technical-guidance-capacity/technical-guidance';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @customElement
 */
export class InterventionDetails extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      <details-overview></details-overview>
      <partner-info></partner-info>
      <unicef-details></unicef-details>
      <document-details></document-details>
      <geographical-coverage></geographical-coverage>
      <gender-equity-rating></gender-equity-rating>
      <technical-guidance></technical-guidance>
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

window.customElements.define('intervention-details', InterventionDetails);
