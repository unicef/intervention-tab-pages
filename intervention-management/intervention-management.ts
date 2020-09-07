import {LitElement, customElement, html} from 'lit-element';
import './programmatic-visits/programmatic-visits';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './review-and-sign/review-and-sign';
import './financial/financial-component';
import './risks/risks';
import './final-review/final-review';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-management')
export class InterventionManagement extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      <review-and-sign></review-and-sign>
      <risks-element></risks-element>
      <programmatic-visits></programmatic-visits>
      <pd-amendments></pd-amendments>
      <financial-component></financial-component>
      <fund-reservations></fund-reservations>
      <final-review></final-review>
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
