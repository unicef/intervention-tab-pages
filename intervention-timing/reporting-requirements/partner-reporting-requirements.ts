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
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {contentSectionStylesLit} from '../../common/styles/content-section-styles-lit';

import {HumanitarianReportingReqUnicefEl} from './hr/humanitarian-reporting-req-unicef';
import {QuarterlyReportingRequirementsEL} from './qpr/quarterly-reporting-requirements';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {selectReportingRequirementsPermissions} from './reportingRequirementsPermissions.selectors';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {isUnicefUser} from '../../common/selectors';
import {connectStore} from '../../common/mixins/connect-store-mixin';
import {AnyObject, Permission} from '@unicef-polymer/etools-types';
// import {openDialog} from '../../utils/dialog';

/**
 * @polymer
 * @customElement
 */
@customElement('partner-reporting-requirements')
export class PartnerReportingRequirements extends connectStore(LitElement) {
  render() {
    return html`
      <style>
        ${contentSectionStylesLit}${gridLayoutStylesLit}:host {
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
      </style>
      <etools-content-panel show-expand-btn class="content-section" panel-title="Partner Reporting Requirements">
        <div class="flex-c layout-horizontal">
          <div class="reports-menu nav-menu">
            <div
              name="qtyProgress"
              title="Quarterly Progress Reports"
              class="nav-menu-item qpr"
              ?selected="${this.isSelected('qtyProgress')}"
              @click="${() => this.selectType('qtyProgress')}"
            >
              <span>Quarterly Progress Reports (${this.qprRequirementsCount})</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                @click="${this._openQprEditDialog}"
                ?hidden="${!this._hideRepReqEditBtn(this.isReadonly, this.qprRequirementsCount)}"
              ></paper-icon-button>
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
                .interventionId="${this.interventionId}"
                .interventionStart="${this.interventionStart}"
                .interventionEnd="${this.interventionEnd}"
                .requirementsCount="${this.qprRequirementsCount}"
                .editMode="${!this.isReadonly}"
              >
              </quarterly-reporting-requirements>
              <humanitarian-reporting-req-unicef
                id="hru"
                name="humanitarianUnicef"
                .interventionId="${this.interventionId}"
                .interventionStart="${this.interventionStart}"
                .requirementsCount="${this.hrUnicefRequirementsCount}"
                .expectedResults="${this.expectedResults}"
                .editMode="${!this.isReadonly}"
              >
              </humanitarian-reporting-req-unicef>
              <humanitarian-reporting-req-cluster
                name="humanitarianCluster"
                .interventionId="${this.interventionId}"
                .requirementsCount="${this.hrClusterRequirementsCount}"
                .expectedResults="${this.expectedResults}"
              >
              </humanitarian-reporting-req-cluster>

              <special-reporting-requirements
                name="special"
                .interventionId="${this.interventionId}"
                .requirementsCount="${this.specialRequirementsCount}"
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
    // this.qrrDialogEl.openQuarterlyRepRequirementsDialog();
    // this.qrrDialogEl.openQuarterlyRepRequirementsDialog();
    // openDialog({
    //   dialog: 'quarterly-reporting-requirements'
    // });
  }

  _openHruEditDialog() {
    this.hrrDialogEl.openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(readonly: boolean, qprCount: number) {
    console.log('qprCount', qprCount);
    console.log('readonly', readonly);
    return qprCount === 0 || readonly;
  }

  selectType(selectedTab: string): void {
    if (this.commentsMode) {
      return;
    }
    this.selectedReportType = selectedTab;
  }

  isSelected(type: string): boolean {
    return type === this.selectedReportType;
  }
}
