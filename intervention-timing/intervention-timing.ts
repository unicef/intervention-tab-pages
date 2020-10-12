import {LitElement, customElement, html} from 'lit-element';
import './reporting-requirements/partner-reporting-requirements';
import './intervention-dates/intervention-dates';
import './timing-overview/timing-overview';
import './activity-timeframes/activity-timeframes';
import {fireEvent} from '../utils/fire-custom-event';
import {CommentElementMeta, CommentsMixin} from '../common/components/comments/comments-mixin';

/**
 * @customElement
 */
@customElement('intervention-timing')
export class InterventionTiming extends CommentsMixin(LitElement) {
  render() {
    // language=HTML
    return html`
      <style></style>
      <timing-overview></timing-overview>
      <intervention-dates></intervention-dates>
      <activity-timeframes></activity-timeframes>
      <partner-reporting-requirements
        class="content-section"
        .commentsMode="${this.commentMode}"
        comments-container
      ></partner-reporting-requirements>
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

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    return Array.from(container.shadowRoot!.querySelectorAll('.nav-menu-item')).map((element: any) => {
      const relatedTo: string = element.getAttribute('name') as string;
      const relatedToDescription = element.getAttribute('title') as string;
      return {element, relatedTo, relatedToDescription};
    });
  }
}
