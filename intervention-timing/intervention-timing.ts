import {LitElement, customElement, html, property} from 'lit-element';
import './reporting-requirements/partner-reporting-requirements';
import './intervention-dates/intervention-dates';
import './timing-overview/timing-overview';
import './activity-timeframes/activity-timeframes';
import './programmatic-visits/programmatic-visits';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {CommentElementMeta, CommentsMixin} from '../common/components/comments/comments-mixin';
import {RootState} from '../common/types/store.types';

/**
 * @customElement
 */
@customElement('intervention-timing')
export class InterventionTiming extends CommentsMixin(LitElement) {
  @property() viewPlannedVisits = false;
  @property() viewPartnerReportingRequirements = false;
  render() {
    // language=HTML
    return html`
      <style></style>
      <timing-overview></timing-overview>
      <intervention-dates></intervention-dates>
      <activity-timeframes></activity-timeframes>
      ${this.viewPartnerReportingRequirements
        ? html`<partner-reporting-requirements
            class="content-section"
            .commentsMode="${this.commentMode}"
            comments-container
          ></partner-reporting-requirements>`
        : ''}
      ${this.viewPlannedVisits ? html`<programmatic-visits></programmatic-visits>` : ''}
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

  stateChanged(state: RootState) {
    super.stateChanged(state);

    this.viewPlannedVisits = Boolean(state.interventions?.current?.permissions?.view!.planned_visits);
    this.viewPartnerReportingRequirements = Boolean(
      state.interventions?.current?.permissions?.view!.reporting_requirements
    );
  }

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    return Array.from(container.shadowRoot!.querySelectorAll('.nav-menu-item')).map((element: any) => {
      const relatedTo: string = element.getAttribute('name') as string;
      const relatedToDescription = element.getAttribute('title') as string;
      return {element, relatedTo, relatedToDescription};
    });
  }
}
