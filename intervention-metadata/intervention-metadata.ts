import {LitElement, html, property} from 'lit-element';
import './partner-details/partner-info';
import './details-overview/details-overview';
import './unicef-details/unicef-details';
import './geographical-coverage/geographical-coverage';
import './amendments/pd-amendments';
import './fund-reservations/fund-reservations';
import './review-and-sign/review-and-sign';
import './other/other';
import {fireEvent} from '../utils/fire-custom-event';
import {connectStore} from '../common/mixins/connect-store-mixin';
import {RootState} from '../common/types/store.types';

/**
 * @customElement
 */
export class InterventionMetadata extends connectStore(LitElement) {
  @property() showAmendments = false;
  @property() showFundReservations = false;
  render() {
    // language=HTML
    return html`
      <style></style>

      <details-overview></details-overview>
      <partner-info></partner-info>
      <unicef-details></unicef-details>
      <geographical-coverage></geographical-coverage>
      ${this.showFundReservations ? html`<fund-reservations></fund-reservations>` : ''}
      ${this.showAmendments ? html`<pd-amendments></pd-amendments>` : ''}
      <review-and-sign></review-and-sign>
      <other-metadata></other-metadata>
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

  stateChanged(state: RootState): void {
    this.showAmendments = state.interventions.current?.permissions?.view.amendments;
    this.showFundReservations = state.interventions.current?.permissions?.view.frs;
  }
}

window.customElements.define('intervention-metadata', InterventionMetadata);
