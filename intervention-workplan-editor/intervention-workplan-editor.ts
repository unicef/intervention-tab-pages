import {LitElement, customElement, html, css, property} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './workplan-editor-link';
import '../intervention-workplan/budget-summary/budget-summary';
import {TABS} from '../common/constants';
import {translate} from 'lit-translate';
import './editor-table';

/**
 * @customElement
 */
@customElement('intervention-workplan-editor')
export class InterventionWorkplanEditor extends LitElement {
  @property() interventionId!: number;
  render() {
    // language=HTML
    return html`
      <div class="top-card">
        <workplan-editor-link link="interventions/${this.interventionId}/${TABS.Workplan}">
          ${translate('BACK_TO_WORKPLAN')}
        </workplan-editor-link>

        <budget-summary embeded></budget-summary>
      </div>
      <editor-table></editor-table>
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

  static get styles() {
    // language=css
    return css`
      .top-card {
        background-color: var(--primary-background-color);
        padding: 20px 22px 1px 22px;
      }
    `;
  }
}
