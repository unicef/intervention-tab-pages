import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {InterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate} from 'lit-translate';

/**
 * @customElement
 */
@customElement('details-overview')
export class DetailsOverview extends CommentsMixin(ComponentBaseMixin(LitElement)) {
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
          flex: 1;
          flex-basis: 0.000000001px;
        }
        @media (max-width: 900px) {
          .container-width {
            width: 100%;
          }
        }
      </style>
      <section class="elevation content-wrapper" elevation="1" comment-element="details" comment-description="Details">
        <div class="container-width">
          <div class="layout-horizontal">
            <div class="flex-2">
              <span>
                <label class="paper-label">${translate('INTERVENTION_DETAILS.DOCUMENT_TYPE')}</label>
              </span>
            </div>
            <div class="flex-3">
              <span>
                <label class="paper-label">${translate('INTERVENTION_DETAILS.UNPP_CFEI_DSR')}</label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="paper-label">${translate('INTERVENTION_DETAILS.HUMANITARIAN')}</label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="paper-label">${translate('INTERVENTION_DETAILS.CONTINGENCY')}</label>
              </span>
            </div>
          </div>
          <div class="layout-horizontal">
            <div class="flex-2">
              <span>
                <label class="input-label" ?empty="${!this.interventionOverview.document_type}">
                  ${this.getDocumentLongName(this.interventionOverview.document_type)}
                </label>
              </span>
            </div>
            <div class="flex-3">
              <span>
                <label class="input-label" ?empty="${!this.interventionOverview.cfei_number}">
                  ${this.interventionOverview.cfei_number}
                </label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="input-label"> ${this._getText(this.interventionOverview.humanitarian_flag)} </label>
              </span>
            </div>
            <div class="flex-1">
              <span>
                <label class="input-label"> ${this._getText(this.interventionOverview.contingency_pd)} </label>
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

  public stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (state.interventions.current) {
      this.interventionOverview = selectInterventionOverview(state);
    }
    super.stateChanged(state);
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
