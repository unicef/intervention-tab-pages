import {LitElement, customElement, html, property, PropertyValues} from 'lit-element';
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
import {sectionContentStyles} from '../../common/styles/content-section-styles-polymer';

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
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {callClickOnSpacePush} from '../../utils/common-methods';

/**
 * @polymer
 * @customElement
 */
@customElement('partner-reporting-requirements')
export class PartnerReportingRequirements extends connectStore(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      ${sectionContentStyles}
      <style>
        ${sharedStyles} :host {
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
          background: var(--primary-background-color);
          min-width: 290px;
          margin-top: 9px;
          margin-bottom: 8px;
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
          height: 45px;
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
      </style>
      <etools-content-panel show-expand-btn class="content-section" panel-title="Partner Reporting Requirements">
        <div class="flex-c layout-horizontal">
          <div class="reports-menu nav-menu">
            <div
              name="qtyProgress"
              title="Quarterly Progress Reports"
              class="nav-menu-item qpr"
              ?selected="${this.isSelected('qtyProgress')}"
              @click="${this.selectType}"
              tabindex="0"
              id="clickable"
            >
              <span>Quarterly Progress Reports (${this.qprRequirementsCount})</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                @click="${this._openQprEditDialog}"
                ?hidden="${this._hideRepReqEditBtn(this.isReadonly, this.qprRequirementsCount)}"
              ></paper-icon-button>
            </div>
            <div
              name="humanitarianUnicef"
              title="Humanitarian Reports - UNICEF"
              class="nav-menu-item"
              ?selected="${this.isSelected('humanitarianUnicef')}"
              @click="${this.selectType}"
              tabindex="0"
              id="clickable"
            >
              <span>Humanitarian Reports - UNICEF (${this.hrUnicefRequirementsCount})</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                @click="${this._openHruEditDialog}"
                ?hidden="${this._hideRepReqEditBtn(this.isReadonly, this.hrUnicefRequirementsCount)}"
              ></paper-icon-button>
            </div>
            ${this.isUnicefUser
              ? html` <div
                  name="humanitarianCluster"
                  title="Humanitarian Reports - Cluster"
                  class="nav-menu-item"
                  ?selected="${this.isSelected('humanitarianCluster')}"
                  @click="${this.selectType}"
                  tabindex="0"
                  id="clickable"
                >
                  Humanitarian Reports - Cluster (${this.hrClusterRequirementsCount})
                </div>`
              : html``}

            <div
              name="special"
              title="Special Report"
              class="nav-menu-item"
              ?selected="${this.isSelected('special')}"
              @click="${this.selectType}"
              tabindex="0"
              id="clickable"
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
                .interventionId="${this.interventionId}"
                .interventionStart="${this.interventionStart}"
                .interventionEnd="${this.interventionEnd}"
                .requirementsCount="${this.qprRequirementsCount}"
                .editMode="${!this.isReadonly}"
                @count-changed=${(e: CustomEvent) => this.updateQPRCount(e.detail)}
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
                @count-changed=${(e: CustomEvent) => this.updateHRUCount(e.detail)}
              >
              </humanitarian-reporting-req-unicef>

              <humanitarian-reporting-req-cluster
                name="humanitarianCluster"
                .interventionId="${this.interventionId}"
                .requirementsCount="${this.hrClusterRequirementsCount}"
                .expectedResults="${this.expectedResults}"
                @count-changed=${(e: CustomEvent) => this.updateHRCCount(e.detail)}
              >
              </humanitarian-reporting-req-cluster>

              <special-reporting-requirements
                name="special"
                .interventionId="${this.interventionId}"
                .requirementsCount="${this.specialRequirementsCount}"
                @count-changed=${(e: CustomEvent) => this.updateSRRCount(e.detail)}
              >
              </special-reporting-requirements>
            </iron-pages>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.shadowRoot!.querySelectorAll('#clickable').forEach((el) => callClickOnSpacePush(el));
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

  updateQPRCount(value: any) {
    if (value) {
      this.qprRequirementsCount = value.count;
    }
  }

  updateHRUCount(value: any) {
    if (value) {
      this.hrUnicefRequirementsCount = value.count;
    }
  }

  updateHRCCount(value: any) {
    if (value) {
      this.hrClusterRequirementsCount = value.count;
    }
  }

  updateSRRCount(value: any) {
    if (value) {
      this.specialRequirementsCount = value.count;
    }
  }

  _isReadOnly() {
    return (
      this.commentsMode ||
      !this.reportingRequirementsPermissions ||
      !this.reportingRequirementsPermissions.edit.reporting_requirements
    );
  }

  _openQprEditDialog() {
    const dialog = this.shadowRoot!.querySelector(`#qpr`) as QuarterlyReportingRequirementsEL;
    dialog.openQuarterlyRepRequirementsDialog();
  }

  _openHruEditDialog() {
    const dialog = this.shadowRoot!.querySelector(`#hru`) as HumanitarianReportingReqUnicefEl;
    dialog.openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(readonly: boolean, qprCount: number) {
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
