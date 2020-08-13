import {LitElement, customElement, html} from 'lit-element';
import './programmatic-visits/programmatic-visits';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './review-and-sign/review-and-sign';

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
      <programmatic-visits></programmatic-visits>
      <pd-amendments></pd-amendments>
      <fund-reservations></fund-reservations>
    `;
  }
}
