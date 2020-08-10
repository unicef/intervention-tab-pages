import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {InterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {layoutFlex} from '../../common/styles/flex-layout-styles';

/**
 * @customElement
 */
@customElement('details-overview')
export class DetailsOverview extends connect(getStore())(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }
  render() {
    // language=HTML
    if (!this.interventionOverview) {
      return html` <style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
        .container-width {
          width: 70%;
          ${layoutFlex}
        }
        @media (max-width: 900px) {
          .container-width {
            width: 100%;
          }
        }
      </style>
      <section class="elevation content-wrapper" elevation="1">
        <div class="container-width">
          <div class="layout-horizontal">
            <div class="flex-2">
              <span>
                <label class="paper-label">Document Type</label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="paper-label">CFEI Number</label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="paper-label">Humanitarian</label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="paper-label">Contingency</label>
              </span>
            </div>
          </div>
          <div class="layout-horizontal">
            <div class="flex-2">
              <span>
                <label class="input-label" ?empty="${!this.interventionOverview.document_type}">
                  ${this.interventionOverview.document_type}
                </label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="input-label" ?empty="${!this.interventionOverview.cfei_number}">
                  ${this.interventionOverview.cfei_number}
                </label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="input-label">
                  ${this._getText(this.interventionOverview.contingency_pd)}
                </label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="input-label">
                  ${this._getText(this.interventionOverview.humanitarian_flag)}
                </label>
              </span>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  @property({type: Object})
  interventionOverview!: InterventionOverview;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: any) {
    if (state.interventions.current) {
      this.interventionOverview = selectInterventionOverview(state);
    }
  }

  private _getText(value: boolean): string {
    if (value === undefined) {
      return '-';
    }
    if (value) {
      return 'Yes';
    } else {
      return 'No';
    }
  }
}
