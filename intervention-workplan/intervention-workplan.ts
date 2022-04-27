import {LitElement, customElement, html, property} from 'lit-element';
import './budget-summary/budget-summary';
import './supply-agreement/supply-agreement';
import './results-structure/results-structure';
import './effective-efficient-programme-mgmt/effective-efficient-programme-mgmt';
import './non-financial-contribution/non-financial-contribution';
import './hq-contribution/hq-contribution';
import '../intervention-workplan-editor/workplan-editor-link';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-workplan')
export class InterventionWorkplan extends LitElement {
  @property() interventionId!: number;
  render() {
    // language=HTML
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: column;
        }
      </style>

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
