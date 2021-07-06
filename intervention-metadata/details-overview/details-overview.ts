import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {InfoElementStyles} from '../../common/styles/info-element-styles';
import {InterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate} from 'lit-translate';
import {allPartners, currentIntervention, isUnicefUser} from '../../common/selectors';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {TABS} from '../../common/constants';
import {StaticPartner} from '@unicef-polymer/etools-types';

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
      ${InfoElementStyles}
      <style>
        ${sharedStyles} .data-column {
          max-width: none;
        }
        .container-width {
          width: 70%;
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
        }
        @media (max-width: 1420px) {
          .container-width {
            width: 100%;
          }
        }
      </style>
      <section
        class="elevation table not-allowed"
        elevation="1"
        comment-element="details"
        comment-description="Details"
      >
        <div class="container-width">
          <div class="data-column flex-2">
            <label class="paper-label">${translate('DOCUMENT_TYPE')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.document_type}">
              ${this.getDocumentLongName(this.interventionOverview.document_type)}
            </div>
          </div>
          <div class="data-column flex-3">
            <label class="paper-label">${translate('UNPP_CFEI_DSR')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.cfei_number}">
              ${this.interventionOverview.cfei_number}
            </div>
          </div>
          <div class="data-column flex-1">
            <label class="paper-label">${translate('HUMANITARIAN')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.humanitarian_flag)}</div>
          </div>
          <div class="data-column flex-1">
            <label class="paper-label">${translate('CONTINGENCY')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.contingency_pd)}</div>
          </div>
          <div class="data-column flex-2" ?hidden="${!this.isUnicefUser}">
            <label class="paper-label">${translate('PARTNER_HACT_RR')}</label>
            <div class="input-label">${this.getPartnerHactRiskRatingHtml()}</div>
          </div>
          <div class="data-column flex-2" ?hidden="${!this.isUnicefUser}">
            <label class="paper-label">${translate('PARTNER_PSEA_RR')}</label>
            <div class="input-label">${this.getPartnerPseaRiskRatingHtml()}</div>
          </div>

          <etools-info-tooltip icon="icons:info" position="left" id="not-allowed-icon">
            <span slot="message">
              <span>${translate('METADATA_TOOLTIP')}</span>
            </span>
          </etools-info-tooltip>
        </div>
      </section>
    `;
  }

  @property({type: Array})
  interventionPartner!: AnyObject;

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  interventionOverview!: InterventionOverview;

  @property({type: Boolean})
  isUnicefUser = false;

  connectedCallback() {
    super.connectedCallback();
  }

  public stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Metadata)) {
      return;
    }

    if (state.interventions.current) {
      this.interventionOverview = selectInterventionOverview(state);
      this.isUnicefUser = isUnicefUser(state);
      this.intervention = currentIntervention(state);
      this.interventionPartner =
        allPartners(state).find((partner: StaticPartner) => partner.name === this.intervention.partner) || {};
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

  getPartnerPseaRiskRatingHtml() {
    if (!this.interventionPartner?.sea_risk_rating_name) {
      return html`N\\A`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/psea/assessments/list?partner=${this.intervention.partner_id}">
      <strong class="blue">${this.interventionPartner.sea_risk_rating_name}</strong></a
    >`;
  }

  getPartnerHactRiskRatingHtml() {
    if (!this.interventionPartner?.rating) {
      return html`N\\A`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/ap/engagements/list?partner__in=${this.intervention.partner_id}">
      <strong class="blue">${this.interventionPartner.rating}</strong></a
    >`;
  }
}
