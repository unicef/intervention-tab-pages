import {LitElement, customElement, html, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/iron-label/iron-label';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import {elevationStyles} from '../common/styles/elevation-styles';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../common/styles/shared-styles-lit';
import {Intervention, CpOutput, ExpectedResult} from '../common/models/intervention.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../utils/redux-store-access';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {prettyDate} from '../utils/date-utils';
import {isJsonStrMatch} from '../utils/utils';
import './fund-reservations-display/fund-reservations-display';
import './monitoring-visits-list/monitoring-visits-list';
import {MinimalAgreement} from '../common/models/agreement.types';
import {pageIsNotCurrentlyActive} from '../utils/common-methods';
import {AnyObject} from '../common/models/globals.types';

/**
 * @customElement
 */
@customElement('intervention-overview')
export class InterventionOverview extends connect(getStore())(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
  }
  render() {
    if (!this.interventionCpOutputs || !this.intervention) {
      return html`<etools-loading loading-text="Loading..." active></etools-loading>`;
    }

    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          width: 100%;
          --ecp-content-padding: 0px;
          --paper-input-container-underline-disabled: {
            display: none;
            width: 140px;
          }
        }
        .block {
          display: block !important;
        }
        .content {
          margin-top: 8px;
        }
        iron-label {
          color: var(--dark-secondary-text-color);
        }
        .secondary {
          color: var(--dark-secondary-text-color);
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
        #top-container {
          margin-bottom: 24px;
        }
        etools-content-panel {
          margin-bottom: 24px;
        }
        div[elevation] {
          padding: 15px 20px;
          background-color: var(--primary-background-color);
        }
        etools-currency-amount-input {
          width: 140px;
          text-align: right;
        }
      </style>

      <div class="page-content elevation" elevation="1" id="top-container">
        <div class="row-h flex-c">
          <div class="col col-12 block">
            <iron-label for="cp_outputs_list">
              Cp Output(s)
            </iron-label>
            <br />
            <div class="content" id="cp_outputs_list">
              ${this.interventionCpOutputs.map((cpOut: string) => html`<strong>${cpOut}</strong><br />`)}
            </div>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-12 block">
            <iron-label for="document_title">
              Document Title
            </iron-label>
            <br />
            <div class="content" id="document_title">
              ${this.intervention.title}
            </div>
            <div class="secondary">
              Under
              <strong class="blue">${this.interventionAgreement.agreement_type}</strong>
              with
              <a href="/pmp/partners/${this.intervention.partner_id}/details">
                <strong class="blue">${this.intervention.partner}</strong>
              </a>
            </div>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4 block">
            <iron-label for="interventions_timeline">
              Timeline
            </iron-label>
            <br />
            <div class="content" id="interventions_timeline">
              ${prettyDate(this.intervention.start)} - ${prettyDate(this.intervention.end)}
            </div>
          </div>
          <div class="col col-4 block">
            <iron-label for="intervention-sections">
              Sections
            </iron-label>
            <br />
            <div class="content" id="intervention-sections">
              ${this.inteventionSections}
            </div>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-4 block">
              <label class="paper-label">Unicef Cash Contribution</label>
              </br>
              <etools-currency-amount-input
              .value="${this.intervention.planned_budget.unicef_cash_local}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              disabled
            >
            </etools-currency-amount-input>
          </div>
          <div class="col col-4 block">
            <label class="paper-label">Unicef Supply Contribution</label>
            </br>
            <etools-currency-amount-input
              .value="${this.intervention.planned_budget.in_kind_amount_local}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              disabled
            >
            </etools-currency-amount-input>
          </div>
          <div class="col col-4 block">
            <label class="paper-label">Total Unicef Contribution</label>
            </br>
            <etools-currency-amount-input
              .value="${this._getTotalUnicef()}"
              type="number"
              placeholder="&#8212;"
              no-label-float
              disabled
            >
            </etools-currency-amount-input>
          </div>
        </div>
      <div class="row-h flex-c">
         <div class="col col-4 block">
          <label class="paper-label">Partner HACT Risk Rating</label>
          <br />
          <div class="content">
            ${this.interventionPartner.rating || 'N\\A'}
          </div>
        </div>
        <div class="col col-4 block">
          <label class="paper-label">Partner PSEA Risk Rating</label>
          <br />
          <div class="content">
            ${this.interventionPartner.sea_risk_rating_name || 'N\\A'}
          </div>
        </div>
       </div>
      </div>

      ${
        this.isUnicefUser
          ? html`
              <etools-content-panel
                id="fund-reservation-display"
                class="content-section"
                panel-title="Implementation Status"
              >
                <fund-reservations-display
                  .intervention="${this.intervention}"
                  .frsDetails="${this.intervention.frs_details}"
                ></fund-reservations-display>
              </etools-content-panel>

              <etools-content-panel
                id="monitoring-visits-panel"
                class="content-section"
                panel-title="Monitoring Activities"
              >
                <monitoring-visits-list
                  .interventionId="${this.intervention.id}"
                  .partnerId="${this.intervention.partner_id}"
                  showTpmVisits
                >
                </monitoring-visits-list>
              </etools-content-panel>
            `
          : html``
      }
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
  interventionCpOutputs: string[] = [];

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

  stateChanged(state: any) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'overview')) {
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
    if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
      this.cpOutputs = [...state.commonData!.cpOutputs];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
    if (this.intervention && get(state, 'commonData.partners')) {
      const partners = [...state.commonData!.partners];
      const interventionPartner = partners.find((partner) => partner.name === this.intervention.partner);
      this.interventionPartner = interventionPartner || {};
    }
    if (this.sections && this.intervention) {
      this._parseSections(this.sections.length, this.intervention.sections.length);
    }
    if (this.cpOutputs && this.resultLinks) {
      this._parseCpOutputs(this.cpOutputs.length, this.resultLinks.length);
    }
    if (state.user && state.user.data) {
      this.isUnicefUser = state.user.data.is_unicef_user;
    }
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
      this.inteventionSections = '';
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

  _getTotalUnicef() {
    let total = 0;
    if (this.intervention.planned_budget.unicef_cash_local) {
      const val = parseFloat(this.intervention.planned_budget.unicef_cash_local);
      if (!isNaN(val)) {
        total += val;
      }
    }
    if (this.intervention.planned_budget.in_kind_amount_local) {
      const val = parseFloat(this.intervention.planned_budget.in_kind_amount_local);
      if (!isNaN(val)) {
        total += val;
      }
    }
    return total;
  }
}
