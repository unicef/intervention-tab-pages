import {LitElement, customElement, html} from 'lit-element';
import './reporting-requirements/partner-reporting-requirements';
import './intervention-dates/intervention-dates';
import './timing-overview/timing-overview';
import './activity-timeframes/activity-timeframes';

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
}
