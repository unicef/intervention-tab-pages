import {LitElement, customElement, html} from 'lit-element';
import './risks/risks';
import './document-details/document-details';
import './geographical-coverage/geographical-coverage';
import './gender-equity-rating/gender-equity-rating';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-strategy')
export class InterventionStrategy extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      <document-details></document-details>
      <geographical-coverage></geographical-coverage>
      <gender-equity-rating></gender-equity-rating>
      <risks-element></risks-element>
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
