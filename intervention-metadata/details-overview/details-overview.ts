import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {InfoElementStyles} from '@unicef-polymer/etools-modules-common/dist/styles/info-element-styles';
import {InterventionOverview} from './interventionOverview.models';
import {selectInterventionOverview} from './interventionOverview.selectors';
import {RootState} from '../../common/types/store.types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {formatDateLocalized} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import get from 'lodash-es/get';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {translate, get as getTranslation, langChanged} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {allPartners, currentIntervention, isUnicefUser} from '../../common/selectors';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {Intervention} from '@unicef-polymer/etools-types/dist/models-and-classes/intervention.classes';
import {TABS} from '../../common/constants';
import CONSTANTS from '../../common/constants';
import {StaticPartner} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import {getPageDirection} from '../../utils/utils';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

/**
 * @customElement
 */
@customElement('details-overview')
export class DetailsOverview extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles, elevationStyles];
  }
  render() {
    // language=HTML
    if (!this.interventionOverview) {
      return html` ${sharedStyles}
        <etools-loading source="details-overview" active></etools-loading>`;
    }
    return html`
      ${InfoElementStyles} ${sharedStyles}
      <style>
        .data-column {
          max-width: none;
        }
        .data-column {
          margin-inline-end: 20px;
          padding-inline-start: 0px;
        }
      </style>
      <section class="elevation" elevation="1" comment-element="details">
        <div class="table not-allowed">
          <div class="data-column">
            <label class="label">${translate('DOCUMENT_TYPE')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.document_type}">
              ${this.getDocumentLongName(this.interventionOverview.document_type)}
            </div>
          </div>
          <div class="data-column">
            <label class="label">${translate('UNPP_CFEI_DSR')}</label>
            <div class="input-label" ?empty="${!this.interventionOverview.cfei_number}">
              ${this.interventionOverview.cfei_number}
            </div>
          </div>
          <div class="data-column">
            <label class="label">${translate('HUMANITARIAN')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.humanitarian_flag)}</div>
          </div>
          <div class="data-column">
            <label class="label">${translate('CONTINGENCY')}</label>
            <div class="input-label">${this._getText(this.interventionOverview.contingency_pd)}</div>
          </div>
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="label">${translate('PARTNER_HACT_RR')}</label>
            <div class="input-label">${this.getPartnerHactRiskRatingHtml()}</div>
          </div>
          <div class="data-column" ?hidden="${!this.isUnicefUser}">
            <label class="label">${translate('PARTNER_PSEA_RR')}</label>
            <div class="input-label">${this.getPartnerPseaRiskRatingHtml()}</div>
          </div>
          <div class="data-column">
            <label class="label">${translate('CORE_VALUES_ASSESSMENT_DATE')}</label>
            <div class="input-label" ?empty="${!this.interventionPartner?.last_assessment_date}">
              ${formatDateLocalized(this.interventionPartner?.last_assessment_date)}
            </div>
          </div>
          <div class="data-column">
            <label class="label">${translate('PSEA_ASSESSMENT_DATE')}</label>
            <div class="input-label" ?empty="${!this.interventionPartner?.psea_assessment_date}">
              ${formatDateLocalized(this.interventionPartner?.psea_assessment_date)}
            </div>
          </div>
        </div>
        <div class="icon-tooltip-div">
          <info-icon-tooltip
            .tooltipText="${translate('METADATA_TOOLTIP')}"
            position="${this.dir == 'rtl' ? 'right' : 'left'}"
          >
          </info-icon-tooltip>
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
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Metadata)) {
      return;
    }

    if (state.interventions.current) {
      this.interventionOverview = selectInterventionOverview(state);
      this.isUnicefUser = isUnicefUser(state);
      this.intervention = currentIntervention(state);
      this.interventionPartner =
        allPartners(state).find((partner: StaticPartner) => partner.name === this.intervention.partner) || {};
      this.dir = getPageDirection(state);
    }

    super.stateChanged(state);
  }

  private _getText(value: boolean) {
    if (value === undefined) {
      return '-';
    }

    return langChanged(() => {
      if (value) {
        return getTranslation('YES');
      } else {
        return getTranslation('NO');
      }
    });
  }

  getPartnerPseaRiskRatingHtml() {
    if (!this.interventionPartner?.sea_risk_rating_name) {
      return html`${translate('NA')}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/psea/assessments/list?partner=${this.intervention.partner_id}">
      <strong class="blue">${translateValue(this.interventionPartner.sea_risk_rating_name, 'RISK_RATINGS')}</strong></a
    >`;
  }

  getPartnerHactRiskRatingHtml() {
    if (!this.interventionPartner?.rating) {
      return html`${translate('NA')}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/ap/engagements/list?partner__in=${this.intervention.partner_id}">
      <strong class="blue">${translateValue(this.interventionPartner.rating, 'RISK_RATINGS')}</strong></a
    >`;
  }
  getDocumentLongName(value: any) {
    if (!value) {
      return;
    }

    const name = (CONSTANTS.DOCUMENT_TYPES_LONG as any)[value.toUpperCase()];
    return translateValue(name, 'ITEM_TYPE');
  }
}
