import {LitElement, customElement, html} from 'lit-element';
import './budget-summary/budget-summary';
import './supply-agreement/supply-agreement';
import './results-structure/results-structure';
import './effective-efficient-programme-mgmt/effective-efficient-programme-mgmt';

/**
 * @customElement
 */
@customElement('intervention-results')
export class InterventionResults extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      <budget-summary></budget-summary>
      <results-structure></results-structure>
      <effective-and-efficient-programme-management></effective-and-efficient-programme-management>
      <supply-agreements></supply-agreements>
    `;
  }
}
