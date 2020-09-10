import {LitElement, customElement, html} from 'lit-element';
import './reporting-requirements/partner-reporting-requirements';
import './intervention-dates/intervention-dates';
import './timing-overview/timing-overview';
import './activity-timeframes/activity-timeframes';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @customElement
 */
@customElement('intervention-timing')
export class InterventionTiming extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      <timing-overview></timing-overview>
      <intervention-dates></intervention-dates>
      <activity-timeframes></activity-timeframes>
      <partner-reporting-requirements class="content-section"> </partner-reporting-requirements>
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
