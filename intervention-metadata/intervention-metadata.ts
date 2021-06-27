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
import {InterventionPermissionsFields, Permission} from '@unicef-polymer/etools-types';
import {currentInterventionPermissions, currentPage, currentSubpage} from '../common/selectors';
import {selectDatesAndSignaturesPermissions} from '../common/managementDocument.selectors';

/**
 * @customElement
 */
export class InterventionMetadata extends connectStore(LitElement) {
  @property({type: Object})
  permissions!: Permission<InterventionPermissionsFields>;

  @property() showSignatureAndDates = false;

  render() {
    // language=HTML
    return html`
      <style></style>

      <details-overview></details-overview>
      <partner-info></partner-info>
      <unicef-details></unicef-details>
      <geographical-coverage></geographical-coverage>
      ${this.permissions?.view!.frs ? html`<fund-reservations></fund-reservations>` : ''}
      ${this.permissions?.view!.amendments ? html`<pd-amendments></pd-amendments>` : ''}
      ${this.showSignatureAndDates ? html`<review-and-sign></review-and-sign>` : ''}
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
    if (currentPage(state) !== 'interventions' || currentSubpage(state) !== 'metadata') {
      return;
    }
    this.permissions = currentInterventionPermissions(state);
    if (this.permissions) {
      this.setShowSignatureAndDates(state);
    }
  }

  setShowSignatureAndDates(state: RootState) {
    const viewPerm = selectDatesAndSignaturesPermissions(state)?.view;
    this.showSignatureAndDates = Object.values(viewPerm).some(perm => perm === true);
  }
}

window.customElements.define('intervention-metadata', InterventionMetadata);
