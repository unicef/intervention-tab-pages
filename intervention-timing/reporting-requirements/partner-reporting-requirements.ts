import {LitElement, customElement, html, property} from 'lit-element';
import '@polymer/polymer/polymer-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-selector/iron-selector';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-content-panel/etools-content-panel';

import './qpr/quarterly-reporting-requirements';
import './hr/humanitarian-reporting-req-unicef';
import './hr/humanitarian-reporting-req-cluster';
import './srr/special-reporting-requirements';
import {gridLayoutStylesContent} from '../../common/styles/grid-layout-styles-lit';
import {sectionContentStylesLit} from '../../common/styles/content-section-styles-polymer';

import {HumanitarianReportingReqUnicefEl} from './hr/humanitarian-reporting-req-unicef';
import {QuarterlyReportingRequirementsEL} from './qpr/quarterly-reporting-requirements';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {selectReportingRequirementsPermissions} from './reportingRequirementsPermissions.selectors';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {isUnicefUser} from '../../common/selectors';
import {computed} from '@polymer/decorators/lib/decorators';
import {connectStore} from '../../common/mixins/connect-store-mixin';
import {AnyObject, Permission} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
@customElement('partner-reporting-requirements')
export class PartnerReportingRequirements extends connectStore(LitElement) {
  render() {
    return html`
      <style>
        ${gridLayoutStylesContent}${sectionContentStylesLit} :host {
          display: block;
          margin-bottom: 24px;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        etools-content-panel {
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }

        /* ------------------------------- */

        .reporting-req-data {
          border-left: 1px solid var(--darker-divider-color);
        }

        .nav-menu {
          @apply --layout-vertical;
          background: var(--primary-background-color);
          padding: 8px 0 8px 0;
          min-width: 290px;
        }

        .nav-menu-item {
          display: flex;
          align-items: center;
          height: 48px;
          padding-left: 24px;
          padding-right: 24px;
          font-size: 14px;
          font-weight: bold;
          text-transform: capitalize;
          cursor: pointer;
        }

        .nav-menu-item[selected] {
          color: var(--primary-color);
          background-color: var(--medium-theme-background-color);
        }

        .nav-menu-item {
          color: var(--secondary-text-color);
          padding-left: 24px;
          padding-right: 24px;
          font-size: 14px;
          font-weight: bold;
          text-transform: capitalize;
        }
        /* ------------------------------- */

        .edit-rep-req {
          color: var(--primary-text-color);
          margin-left: 16px;
        }

        .nav-menu-item.qpr {
          @apply --layout-horizontal;
          @apply --layout-justified;
        }

        .content-section + .content-section,
        .content-section + * + .content-section,
        .content-section:not(:first-of-type) {
          margin-top: 24px;
        }
        etools-error-messages-box + .content-section {
          margin-top: 0;
        }

        @media print {
          .content-section {
            border: 1px solid var(--list-divider-color);
            --paper-material-elevation-1: {
              box-shadow: none;
            }
          }
        }
      </style>
      <etools-content-panel show-expand-btn class="content-section" panel-title="Partner Reporting Requirements">
        <div class="flex-c layout-horizontal">
          <div class="reports-menu nav-menu">
            <div
              name="qtyProgress"
              title="Quarterly Progress Reports"
              class="nav-menu-item qpr"
              .selected="${this.isSelected('qtyProgress')}"
              @click="${this.selectType}"
            >
              <span>Quarterly Progress Reports (${this.qprRequirementsCount})</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                @click="${this._openQprEditDialog}"
                ?hidden="${!this._hideRepReqEditBtn(this.isReadonly, this.qprRequirementsCount)}"
              ></paper-icon-button>
            </div>
            <div
              name="humanitarianUnicef"
              title="Humanitarian Reports - UNICEF"
              class="nav-menu-item"
              .selected="${this.isSelected('humanitarianUnicef')}"
              @click="${this.selectType}"
            >
              <span>Humanitarian Reports - UNICEF (${this.hrUnicefRequirementsCount})</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                on-click="_openHruEditDialog"
                ?hidden="${this._hideRepReqEditBtn(this.isReadonly, this.hrUnicefRequirementsCount)}"
              ></paper-icon-button>
            </div>
            ${this.isUnicefUser
              ? html`<div
                  name="humanitarianCluster"
                  title="Humanitarian Reports - Cluster"
                  class="nav-menu-item"
                  .selected="${this.isSelected('humanitarianCluster')}"
                  @click="selectType"
                >
                  Humanitarian Reports - Cluster (${this.hrClusterRequirementsCount})
                </div>`
              : html``}

            <div
              name="special"
              title="Special Report"
              class="nav-menu-item"
              .selected="${this.isSelected('special')}"
              @click="${this.selectType}"
            >
              Special Report (${this.specialRequirementsCount})
            </div>
          </div>
          <div class="flex-c reporting-req-data">
            <iron-pages
              id="reportingPages"
              .selected="${this.selectedReportType}"
              attr-for-selected="name"
              fallback-selection="qtyProgress"
            >
              <quarterly-reporting-requirements
                id="qpr"
                name="qtyProgress"
                intervention-id="${this.interventionId}"
                intervention-start="${this.interventionStart}"
                intervention-end="${this.interventionEnd}"
                requirements-count="${this.qprRequirementsCount}"
                edit-mode="${!this.isReadonly}"
              >
              </quarterly-reporting-requirements>

              <humanitarian-reporting-req-unicef
                id="hru"
                name="humanitarianUnicef"
                intervention-id="${this.interventionId}"
                intervention-start="${this.interventionStart}"
                requirements-count="${this.hrUnicefRequirementsCount}"
                expected-results="${this.expectedResults}"
                edit-mode="${!this.isReadonly}"
              >
              </humanitarian-reporting-req-unicef>

              <humanitarian-reporting-req-cluster
                name="humanitarianCluster"
                intervention-id="${this.interventionId}"
                requirements-count="${this.hrClusterRequirementsCount}"
                expected-results="${this.expectedResults}"
              >
              </humanitarian-reporting-req-cluster>

              <special-reporting-requirements
                name="special"
                intervention-id="${this.interventionId}"
                requirements-count="${this.specialRequirementsCount}"
              >
              </special-reporting-requirements>
            </iron-pages>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  selectedReportType = 'qtyProgress';

  @property({type: Number})
  interventionId!: number;

  @property({type: Date})
  interventionStart!: Date;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Array})
  expectedResults!: [];

  // count properties
  @property({type: Number})
  qprRequirementsCount = 0;

  @property({type: Number})
  hrUnicefRequirementsCount = 0;

  @property({type: Number})
  hrClusterRequirementsCount = 0;

  @property({type: Number})
  specialRequirementsCount = 0;

  @property({type: Object})
  reportingRequirementsPermissions!: Permission<ReportingRequirementsPermissions>;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  commentsMode!: boolean;

  @property({type: Object})
  qrrDialogEl!: QuarterlyReportingRequirementsEL;

  @property({type: Object})
  hrrDialogEl!: HumanitarianReportingReqUnicefEl;

  @property({type: Boolean})
  isReadonly!: boolean;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!get(state, 'interventions.current')) {
      return;
    }
    this.isUnicefUser = isUnicefUser(state);

    this.reportingRequirementsPermissions = selectReportingRequirementsPermissions(state);
    const currentIntervention = get(state, 'interventions.current');
    this.intervention = cloneDeep(currentIntervention);
    this.interventionId = this.intervention.id;
    this.interventionStart = this.intervention.start;
    this.interventionEnd = this.intervention.end;
    this.expectedResults = this.intervention.result_links;
    this.isReadonly = this._isReadOnly();
  }

  _isReadOnly() {
    return (
      this.commentsMode ||
      !this.reportingRequirementsPermissions ||
      !this.reportingRequirementsPermissions.edit.reporting_requirements
    );
  }

  _openQprEditDialog() {
    this.qrrDialogEl.openQuarterlyRepRequirementsDialog();
  }

  _openHruEditDialog() {
    this.hrrDialogEl.openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(readonly: boolean, qprCount: number) {
    console.log('qprCount', qprCount);
    console.log('readonly', readonly);
    console.log(qprCount === 0 || readonly);
    return qprCount === 0 || readonly;
  }

  selectType(event: MouseEvent): void {
    if (this.commentsMode) {
      return;
    }
    const tab: string = (event.currentTarget as HTMLElement).getAttribute('name') as string;
    this.selectedReportType = tab;
  }

  isSelected(type: string): boolean {
    return type === this.selectedReportType;
  }
}
