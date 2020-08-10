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
import {AnyObject} from '../../common/models/globals.types';
import {ReportingRequirementsPermissions} from './reportingRequirementsPermissions.models';
import {Permission} from '../../common/models/intervention.types';
import {selectReportingRequirementsPermissions} from './reportingRequirementsPermissions.selectors';

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
          padding-left: 24px;
          padding-right: 24px;
          font-size: 14px;
          font-weight: bold;
          text-transform: capitalize;

          --paper-item-focused-before: {
            opacity: 0;
          }
        }

        .nav-menu-item.iron-selected {
          color: var(--primary-color);
        }

        .nav-menu-item {
          color: var(--secondary-text-color);
        }

        .nav-menu-item.iron-selected {
          background-color: var(--medium-theme-background-color);
        }

        /* ------------------------------- */

        .edit-rep-req {
          color: var(--medium-icon-color);
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
            <iron-selector selected="{{selectedReportType}}" attr-for-selected="name" selectable="paper-item">
              <paper-item name="qtyProgress" class="nav-menu-item qpr">
                <span>Quarterly Progress Reports ([[qprRequirementsCount]])</span>
                <paper-icon-button
                  class="edit-rep-req"
                  icon="create"
                  on-click="_openQprEditDialog"
                  hidden$="[[_hideRepReqEditBtn(editMode, qprRequirementsCount)]]"
                ></paper-icon-button>
              </paper-item>
              <paper-item name="humanitarianUnicef" class="nav-menu-item">
                <span>Humanitarian Reports - UNICEF ([[hrUnicefRequirementsCount]])</span>
                <paper-icon-button
                  class="edit-rep-req"
                  icon="create"
                  on-click="_openHruEditDialog"
                  hidden$="[[_hideRepReqEditBtn(editMode, hrUnicefRequirementsCount)]]"
                ></paper-icon-button>
              </paper-item>
              <paper-item name="humanitarianCluster" class="nav-menu-item">
                Humanitarian Reports - Cluster ([[hrClusterRequirementsCount]])
              </paper-item>
              <paper-item name="special" class="nav-menu-item">
                Special Report ([[specialRequirementsCount]])
              </paper-item>
            </iron-selector>
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
                edit-mode="[[editMode]]"
              >
              </quarterly-reporting-requirements>

              <humanitarian-reporting-req-unicef
                id="hru"
                name="humanitarianUnicef"
                intervention-id="[[interventionId]]"
                intervention-start="[[interventionStart]]"
                requirements-count="{{hrUnicefRequirementsCount}}"
                expected-results="[[expectedResults]]"
                edit-mode="[[editMode]]"
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

  stateChanged(state: any) {
    if (!get(state, 'interventions.current')) {
      return;
    }
    // @lajos TO DO: get correct values for bellow
    this.editMode = selectReportingRequirementsPermissions(state);
    console.log(this.editMode);
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

  _hideRepReqEditBtn(editMode: boolean, qprCount: number) {
    return qprCount === 0 || !editMode;
  }
}

window.customElements.define('partner-reporting-requirements', PartnerReportingRequirements);
