import {LitElement, html} from 'lit-element';
import './partner-details/partner-details';
import './document-details/document-details';
import './details-overview/details-overview';
import './unicef-details/unicef-details';
import './gender-equity-rating/gender-equity-rating';
import './geographical-coverage/geographical-coverage';
import './technical-guidance-capacity/technical-guidance';

/**
 * @customElement
 */
export class InterventionDetails extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      <details-overview></details-overview>
      <partner-details></partner-details>
      <unicef-details></unicef-details>
      <document-details></document-details>
      <gender-equity-rating></gender-equity-rating>
      <geographical-coverage></geographical-coverage>
      <technical-guidance></technical-guidance>
    `;
  }
}

window.customElements.define('intervention-details', InterventionDetails);
