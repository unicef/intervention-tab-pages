import {LitElement, customElement, html} from 'lit-element';
import './programmatic-visits/programmatic-visits';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './financial/financial-component';

/**
 * @customElement
 */
@customElement('intervention-management')
export class InterventionManagement extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      <programmatic-visits></programmatic-visits>
      <pd-amendments></pd-amendments>
      <financial-component></financial-component>
      <fund-reservations></fund-reservations>
    `;
  }
}
