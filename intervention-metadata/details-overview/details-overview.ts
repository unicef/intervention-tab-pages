import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import {sharedStyles} from '../../../../etools-pages-common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import {elevationStyles} from '../../../../etools-pages-common/styles/elevation-styles';
import {InfoElementStyles} from '../../../../etools-pages-common/styles/info-element-styles';
import {InterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../../../etools-pages-common/utils/common-methods';
import {formatDate} from '../../../../etools-pages-common/utils/date-utils';
import get from 'lodash-es/get';
import ComponentBaseMixin from '../../../../etools-pages-common/mixins/component-base-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate} from 'lit-translate';
import {allPartners, currentIntervention, isUnicefUser} from '../../common/selectors';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {TABS} from '../../common/constants';
import CONSTANTS from '../../common/constants';
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
      return html` ${sharedStyles}
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${InfoElementStyles} ${sharedStyles}
      <style>
        .data-column {
          max-width: none;
        }
        .data-column {
          margin-right: 20px;
          padding-left: 0px;
        }
        .container-width {
          width: 100%;
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
          <div class="data-column">
            <label class="paper-label">${translate('DOCUMENT_TYPE')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.document_type}">
              ${this.getDocumentLongName(this.interventionOverview.document_type)}
            </div>
          </div>
          <div class="data-column">
            <label class="paper-label">${translate('UNPP_CFEI_DSR')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.cfei_number}">
              ${this.interventionOverview.cfei_number}
            </div>
          </div>
          <div class="data-column">
            <label class="paper-label">${translate('HUMANITARIAN')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.humanitarian_flag)}</div>
          </div>
          <div class="data-column">
            <label class="paper-label">${translate('CONTINGENCY')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.contingency_pd)}</div>
          </div>
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="paper-label">${translate('PARTNER_HACT_RR')}</label>
            <div class="input-label">${this.getPartnerHactRiskRatingHtml()}</div>
          </div>
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="paper-label">${translate('PARTNER_PSEA_RR')}</label>
            <div class="input-label">${this.getPartnerPseaRiskRatingHtml()}</div>
          </div>
          <div class="data-column">
            <label class="paper-label">${translate('CORE_VALUES_ASSESSMENT_DATE')}</label>
            <div class="input-label">${formatDate(this.interventionPartner?.last_assessment_date)}</div>
          </div>
          <div class="data-column">
            <label class="paper-label">${translate('PSEA_ASSESSMENT_DATE')}</label>
            <div class="input-label">${formatDate(this.interventionPartner?.psea_assessment_date)}</div>
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
  getDocumentLongName(value: any): string | undefined {
    if (!value) {
      return;
    }
    // @ts-ignore
    return CONSTANTS.DOCUMENT_TYPES_LONG[value.toUpperCase()];
  }
}
