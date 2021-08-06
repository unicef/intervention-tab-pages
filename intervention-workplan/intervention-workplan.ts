import {LitElement, customElement, html} from 'lit-element';
import './budget-summary/budget-summary';
import './supply-agreement/supply-agreement';
import './results-structure/results-structure';
import './effective-efficient-programme-mgmt/effective-efficient-programme-mgmt';
import './non-financial-contribution/non-financial-contribution';
import './hq-contribution/hq-contribution';
import {fireEvent} from '../../../etools-pages-common/utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-workplan')
export class InterventionWorkplan extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>

      <budget-summary></budget-summary>
      <results-structure></results-structure>
      <effective-and-efficient-programme-management></effective-and-efficient-programme-management>
      <hq-contribution></hq-contribution>
      <supply-agreements></supply-agreements>
      <non-financial-contribution></non-financial-contribution>
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
