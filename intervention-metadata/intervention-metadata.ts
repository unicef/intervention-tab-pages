import {LitElement, html} from 'lit-element';
import './partner-details/partner-info';
import './details-overview/details-overview';
import './unicef-details/unicef-details';
import './geographical-coverage/geographical-coverage';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './review-and-sign/review-and-sign';
import './other/other';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @customElement
 */
export class InterventionMetadata extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      <details-overview></details-overview>
      <partner-info></partner-info>
      <unicef-details></unicef-details>
      <geographical-coverage></geographical-coverage>
      <fund-reservations></fund-reservations>
      <pd-amendments></pd-amendments>
      <review-and-sign></review-and-sign>
      <other-metadata></other-metadata>
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

window.customElements.define('intervention-metadata', InterventionMetadata);
