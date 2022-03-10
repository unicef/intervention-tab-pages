import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/iron-label/iron-label';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {RootState} from '../common/types/store.types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {AnyObject, CpOutput, StaticPartner, ManagementBudget} from '@unicef-polymer/etools-types';
import {ExpectedResult, MinimalAgreement, Intervention} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {prettyDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {TABS} from '../common/constants';
import {decimalFractionEquals0, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';

// TODO - NOT USED AT THE MOMENT
@customElement('intervention-summary')
export class InterventionSummary extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }

  render() {
    if ((this.isUnicefUser && !this.interventionCpOutputs) || !this.intervention || !this.interventionAgreement) {
      return html` ${sharedStyles}
        <etools-loading source="summary" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
    ${sharedStyles}
    <style>
       :host {
        width: 100%;
      }

      .block {
        display: block !important;
      }
      .content {
        margin-top: 8px;
        font-size: 14px;
      }
      iron-label {
        color: var(--dark-secondary-text-color);
      }
      .secondary {
        color: var(--dark-secondary-text-color);
        font-size: 14px;
      }
      .label-secondary-color {
        color: var(--secondary-text-color);
        font-size: 14px;
      }
      .blue {
        color: var(--paper-blue-500);
      }
      .sector-label {
        display: inline-block;
        white-space: nowrap;
        height: 19px;
        text-align: center;
        padding: 7px 10px;
        background-color: var(--warning-color);
        text-transform: capitalize;
        font-weight: bold;
        color: var(--light-primary-text-color, #ffffff);
      }

      etools-content-panel {
        margin-bottom: 24px;
      }
      div[elevation] {
        padding: 15px 20px;
        background-color: var(--primary-background-color);
      }
      etools-currency-amount-input {
        width: 160px;
      }
    </style>

      <etools-content-panel
        class="content-section"
        panel-title="${translate('SUMMARY_SUBTAB')}"
      >
      ${
        this.isUnicefUser
          ? html` <div class="row-h flex-c">
              <div class="col col-12 block">
                <iron-label for="cp_outputs_list" class="label-secondary-color">${translate('CP_OUTPUTS')}</iron-label>
                <br />
                <div class="content" id="cp_outputs_list">
                  ${this.interventionCpOutputs.length
                    ? this.interventionCpOutputs.map((cpOut: string) => html`<strong>${cpOut}</strong><br />`)
                    : html`&#8212;`}
                </div>
              </div>
            </div>`
          : ``
      }

      <div class="row-h flex-c">
        <div class="col col-12 block">
          <iron-label for="document_title" class="label-secondary-color"
            >${translate('DOCUMENT_TITLE')}</iron-label
          >
          <br />
          <div class="content" id="document_title">${this.intervention.title}</div>
          <div class="secondary">
            Under
            <strong>${this.interventionAgreement.agreement_type}</strong>
            with
            ${
              this.isUnicefUser
                ? html` <a target="_blank" href="/pmp/partners/${this.intervention.partner_id}/details">
                    <strong class="blue">${this.intervention.partner}</strong>
                  </a>`
                : html`<strong class="blue">${this.intervention.partner}</strong>`
            }
          </div>
        </div>
      </div>

      <div class="row-h flex-c">
        <div class="col col-4 block">
          <iron-label for="interventions_timeline" class="label-secondary-color"
            >${translate('TIMELINE')}</iron-label
          >
          <br />
          <div class="content" id="interventions_timeline">
            ${prettyDate(this.intervention.start)} &#8212; ${prettyDate(this.intervention.end)}
          </div>
        </div>
        <div class="col col-4 block">
          <iron-label for="intervention-sections" class="label-secondary-color"
            >${translate('SECTIONS')}
          </iron-label>
          <br />
          <div class="content" id="intervention-sections">${this.inteventionSections}</div>
        </div>
      </div>

      <div class="row-h flex-c">
        <div class="col col-4">
          <div>
            <label class="label-secondary-color"
              >${translate('TOTAL_VAL_EFF_PROG_MGMT_COST')}</label
            >
            <etools-currency-amount-input
              class="w100"
              type="number"
              .value="${this.intervention.management_budgets?.total}"
              placeholder="&#8212;"
              no-label-float              
              readonly
              tabindex="-1"
            >
            </etools-currency-amount-input>
          </div>
        </div>

        <div class="col col-6">
          <div>
            <label class="label-secondary-color">
              ${translate('TOTAL_VALUE_UNICEF_CONTRIB_EFF')}
            </label>
            <div class="input-label">${this.getUnicefEEContribOutOfTotaUnicefContrib()}</div>
          </div>
        </div>
      </div>

      <div class="row-h flex-c">
        <div class="col col-4">
          <div>
            <label class="label-secondary-color"
              >${translate('UNICEF_CASH_CONTRIBUTION')}</label
            >
            <etools-currency-amount-input
              .value="${this.intervention.planned_budget.unicef_cash_local}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              readonly
              tabindex="-1"
            >
            </etools-currency-amount-input>
          </div>
        </div>
        <div class="col col-4">
          <div>
            <label class="label-secondary-color">${translate('UNICEF_SUPPLY_CONTRIB')}</label>
            <etools-currency-amount-input
              .value="${this.intervention.planned_budget.in_kind_amount_local}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              readonly
              tabindex="-1"
            >
            </etools-currency-amount-input>
          </div>
        </div>
        <div class="col col-4">
          <div>
            <label class="label-secondary-color">${translate('TOTAL_UNICEF_CONTRIBUTION')}</label>
            <etools-currency-amount-input
              .value="${this.intervention.planned_budget.total_unicef_contribution_local}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              readonly
              tabindex="-1"
            >
            </etools-currency-amount-input>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <div class="col col-4 block">
          <label class="label-secondary-color">${translate('PARTNER_HACT_RR')}</label>
          <br />
          <div class="content">${this.getPartnerHactRiskRatingHtml()}</div>
        </div>
        <div class="col col-4 block">
          <label class="label-secondary-color">${translate('PARTNER_PSEA_RR')}</label>
          <br />
          <div class="content">${this.getPartnerPseaRiskRatingHtml()}</div>
        </div>
      </div>
    </div>
    <div style="height: 26px;"></div>
    </etools-content-panel>
    `;
  }
  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object})
  interventionAgreement!: MinimalAgreement;

  @property({type: Array})
  monitoringVisit!: [];

  @property({type: Array})
  cpOutputs!: CpOutput[];

  @property({type: Array})
  interventionCpOutputs!: string[];

  @property({type: Array})
  sections!: AnyObject[];

  @property({type: String})
  inteventionSections = '';

  @property({type: Array})
  resultLinks!: ExpectedResult[];

  @property({type: Array})
  interventionPartner!: AnyObject;

  @property({type: Boolean})
  isUnicefUser = false;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Progress, 'summary')) {
      return;
    }

    if (get(state, 'interventions.current')) {
      const currentIntervention = get(state, 'interventions.current');
      this.intervention = cloneDeep(currentIntervention);
      this.resultLinks = this.intervention.result_links;
    }

    if (this.intervention && get(state, 'agreements.list')) {
      const agreements: MinimalAgreement[] = get(state, 'agreements.list');
      this.interventionAgreement =
        agreements.find((item: MinimalAgreement) => item.id === this.intervention.agreement) ||
        ({} as MinimalAgreement);
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
    if (this.intervention) {
      const partners = get(state, 'commonData.partners') || get(state, 'partners.list') || [];
      const interventionPartner = partners.find((partner: StaticPartner) => partner.name === this.intervention.partner);
      this.interventionPartner = interventionPartner || {};
    }
    if (this.sections && this.intervention) {
      this._parseSections(this.sections.length, this.intervention.sections.length);
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
    if (this.isUnicefUser) {
      if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
        this.cpOutputs = [...state.commonData!.cpOutputs];
      }
      if (this.cpOutputs && this.resultLinks) {
        this._parseCpOutputs(this.cpOutputs.length, this.resultLinks.length);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  getUnicefEEContribOutOfTotaUnicefContrib() {
    const totalEEUnicefContrib = this.getUnicefEEContrib(this.intervention.management_budgets);
    const rawPercentage = (totalEEUnicefContrib * 100) / (this.getTotalUnicefContrib() || 1);

    return this.formatPercentage(rawPercentage) + '%';
  }

  formatPercentage(rawPercentage: number) {
    let percentage = '0';
    if (rawPercentage === 0) {
      return percentage;
    }
    if (rawPercentage < 0.01) {
      percentage = rawPercentage.toFixed(4); // Taking into consideration values like 0.0018
    } else {
      percentage = rawPercentage.toFixed(2);
    }
    if (decimalFractionEquals0(percentage)) {
      percentage = percentage.substring(0, percentage.lastIndexOf('.')); // Removing `.00` form value like `100.00%`
    }
    return percentage;
  }

  private getTotalUnicefContrib() {
    return Number(
      this.intervention.planned_budget ? this.intervention.planned_budget.total_unicef_contribution_local || 0 : 0
    );
  }

  private getUnicefEEContrib(management_budgets?: ManagementBudget) {
    if (!management_budgets) {
      return 0;
    }
    return (
      Number(management_budgets.act1_unicef) +
      Number(management_budgets.act2_unicef) +
      Number(management_budgets.act3_unicef)
    );
  }

  _parseCpOutputs(cpOutputsLength: number, resultsLength: number) {
    if (!cpOutputsLength || !resultsLength) {
      this.interventionCpOutputs = [];
      return;
    }

    let interventionCpOutputs: string[] = [];
    const uniqueIds = [...new Set(this.resultLinks.map((item) => item.cp_output))];
    if (Array.isArray(this.cpOutputs) && this.cpOutputs.length > 0) {
      interventionCpOutputs = this.cpOutputs.filter((cpo) => uniqueIds.includes(cpo.id)).map((cpo) => cpo.name);
    }
    this.interventionCpOutputs = interventionCpOutputs;
  }

  _parseSections(sectionsLength: number, intSectionsLength: number) {
    if (!sectionsLength || !intSectionsLength) {
      this.inteventionSections = '—';
      return;
    }

    this.inteventionSections = this._getIntervSectionNames();
  }

  _getIntervSectionNames() {
    const interventionSections = this.intervention.sections.map((sectionId: string) => parseInt(sectionId, 10));
    const sectionNames: string[] = [];

    this.sections.forEach(function (section: AnyObject) {
      if (interventionSections.indexOf(parseInt(section.id, 10)) > -1) {
        sectionNames.push(section.name);
      }
    });

    return sectionNames.join(', ');
  }

  getPartnerPseaRiskRatingHtml() {
    if (!this.isUnicefUser || !this.interventionPartner?.sea_risk_rating_name) {
      return html`${this.interventionPartner?.sea_risk_rating_name || 'N\\A'}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/psea/assessments/list?partner=${this.intervention.partner_id}">
      <strong class="blue">${this.interventionPartner.sea_risk_rating_name}</strong></a
    >`;
  }

  getPartnerHactRiskRatingHtml() {
    if (!this.isUnicefUser || !this.interventionPartner?.rating) {
      return html`${this.interventionPartner?.rating || 'N\\A'}`;
    }
    // eslint-disable-next-line lit/no-invalid-html
    return html`<a target="_blank" href="/ap/engagements/list?partner__in=${this.intervention.partner_id}">
      <strong class="blue">${this.interventionPartner.rating}</strong></a
    >`;
  }
}
