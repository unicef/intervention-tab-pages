/* eslint-disable lit/no-legacy-template-syntax */
import {PolymerElement, html} from '@polymer/polymer/polymer-element';
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
import {gridLayoutStylesPolymer} from '../../common/styles/grid-layout-styles-polymer';
import {sectionContentStylesPolymer} from '../../common/styles/content-section-styles-polymer';
// @lajos needs to be checked if OK
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';

import {property} from '@polymer/decorators';
import {HumanitarianReportingReqUnicefEl} from './hr/humanitarian-reporting-req-unicef';
import {QuarterlyReportingRequirementsEL} from './qpr/quarterly-reporting-requirements';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {AnyObject, RootState} from '../../common/models/globals.types';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {Permission} from '../../common/models/intervention.types';
import {selectReportingRequirementsPermissions} from './reportingRequirementsPermissions.selectors';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import {isUnicefUser} from '../../common/selectors';
import {computed} from '@polymer/decorators/lib/decorators';

/**
 * @polymer
 * @customElement
 */
class PartnerReportingRequirements extends connect(getStore())(PolymerElement) {
  static get template() {
    return html`
      ${gridLayoutStylesPolymer()}${sectionContentStylesPolymer}
      <style>
        :host {
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
              selected$="[[isSelected('qtyProgress', selectedReportType)]]"
              on-click="selectType"
            >
              <span>Quarterly Progress Reports ([[qprRequirementsCount]])</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                on-click="_openQprEditDialog"
                hidden$="[[_hideRepReqEditBtn(isReadonly, qprRequirementsCount)]]"
              ></paper-icon-button>
            </div>
            <div
              name="humanitarianUnicef"
              title="Humanitarian Reports - UNICEF"
              class="nav-menu-item"
              selected$="[[isSelected('humanitarianUnicef', selectedReportType)]]"
              on-click="selectType"
            >
              <span>Humanitarian Reports - UNICEF ([[hrUnicefRequirementsCount]])</span>
              <paper-icon-button
                class="edit-rep-req"
                icon="create"
                on-click="_openHruEditDialog"
                hidden$="[[_hideRepReqEditBtn(isReadonly, hrUnicefRequirementsCount)]]"
              ></paper-icon-button>
            </div>
            <div
              name="humanitarianCluster"
              title="Humanitarian Reports - Cluster"
              class="nav-menu-item"
              selected$="[[isSelected('humanitarianCluster', selectedReportType)]]"
              hidden$="[[!isUnicefUser]]"
              on-click="selectType"
            >
              Humanitarian Reports - Cluster ([[hrClusterRequirementsCount]])
            </div>
            <div
              name="special"
              title="Special Report"
              class="nav-menu-item"
              selected$="[[isSelected('special', selectedReportType)]]"
              on-click="selectType"
            >
              Special Report ([[specialRequirementsCount]])
            </div>
          </div>
          <div class="flex-c reporting-req-data">
            <iron-pages
              id="reportingPages"
              selected="[[selectedReportType]]"
              attr-for-selected="name"
              fallback-selection="qtyProgress"
            >
              <quarterly-reporting-requirements
                id="qpr"
                name="qtyProgress"
                intervention-id="[[interventionId]]"
                intervention-start="[[interventionStart]]"
                intervention-end="[[interventionEnd]]"
                requirements-count="{{qprRequirementsCount}}"
                edit-mode="[[!isReadonly]]"
              >
              </quarterly-reporting-requirements>

              <humanitarian-reporting-req-unicef
                id="hru"
                name="humanitarianUnicef"
                intervention-id="[[interventionId]]"
                intervention-start="[[interventionStart]]"
                requirements-count="{{hrUnicefRequirementsCount}}"
                expected-results="[[expectedResults]]"
                edit-mode="[[!isReadonly]]"
              >
              </humanitarian-reporting-req-unicef>

              <humanitarian-reporting-req-cluster
                name="humanitarianCluster"
                intervention-id="[[interventionId]]"
                requirements-count="{{hrClusterRequirementsCount}}"
                expected-results="[[expectedResults]]"
              >
              </humanitarian-reporting-req-cluster>

              <special-reporting-requirements
                name="special"
                intervention-id="[[interventionId]]"
                requirements-count="{{specialRequirementsCount}}"
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
  editMode!: Permission<ReportingRequirementsPermissions>;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  commentsMode!: boolean;

  @computed('commentsMode', 'editMode')
  get isReadonly(): boolean {
    return this.commentsMode || !this.editMode;
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'timing')) {
      return;
    }
    if (!get(state, 'interventions.current')) {
      return;
    }
    this.isUnicefUser = isUnicefUser(state);

    // @lajos TO DO: get correct values for bellow
    this.editMode = selectReportingRequirementsPermissions(state);
    const currentIntervention = get(state, 'interventions.current');
    this.intervention = cloneDeep(currentIntervention);
    this.interventionId = this.intervention.id;
    this.interventionStart = this.intervention.start;
    this.interventionEnd = this.intervention.end;
    this.expectedResults = this.intervention.result_links;
  }

  _openQprEditDialog() {
    (this.$.qpr as QuarterlyReportingRequirementsEL).openQuarterlyRepRequirementsDialog();
  }

  _openHruEditDialog() {
    (this.$.hru as HumanitarianReportingReqUnicefEl).openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(readonly: boolean, qprCount: number) {
    return qprCount === 0 || readonly;
  }

  selectType(event: MouseEvent): void {
    if (this.commentsMode) {
      return;
    }
    const tab: string = (event.currentTarget as HTMLElement).getAttribute('name') as string;
    this.set('selectedReportType', tab);
  }

  isSelected(type: string): boolean {
    return type === this.selectedReportType;
  }
}

window.customElements.define('partner-reporting-requirements', PartnerReportingRequirements);
