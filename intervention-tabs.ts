import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button';

import './common/layout/page-content-header/intervention-page-content-header';
import './common/layout/etools-tabs';
// eslint-disable-next-line max-len
import './common/layout/status/etools-status';
import './intervention-actions/intervention-actions';

import {customElement, LitElement, html, property, css} from 'lit-element';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {setStore, getStore} from './utils/redux-store-access';
import {selectAvailableActions, currentPage, currentSubpage} from './common/selectors';
import {elevationStyles} from './common/styles/elevation-styles';
import {AnyObject, RouteDetails, RootState} from './common/models/globals.types';
import {getIntervention} from './common/actions';
import {sharedStyles} from './common/styles/shared-styles-lit';
import {isJsonStrMatch} from './utils/utils';
import {pageContentHeaderSlottedStyles} from './common/layout/page-content-header/page-content-header-slotted-styles';
import {fireEvent} from './utils/fire-custom-event';

const MOCKUP_STATUSES = [
  ['draft', 'Draft'],
  ['signed', 'Signed'],
  ['active', 'Active'],
  ['closed', 'Closed']
];
/**
 * @LitElement
 * @customElement
 */
@customElement('intervention-tabs')
export class InterventionTabs extends LitElement {
  static get styles() {
    return [
      elevationStyles,
      pageContentHeaderSlottedStyles,
      css`
        .page-content {
          margin: 24px;
        }
        @media (max-width: 576px) {
          .page-content {
            margin: 5px;
          }
        }
      `
    ];
  }

  render() {
    if (!this.intervention) {
      return html``;
    }
    // main template
    // language=HTML
    return html`
      <style>
        :host {
          --ecp-header-title_-_text-align: left;
          --ecp-content_-_padding: 8px 24px 16px 24px;
          --ecp-header-bg: #ffffff;
          --epc-header-color: #000000;
          --ecp-header-title: {
            padding: 0 24px 0 0;
            text-align: left;
            font-size: 18px;
            font-weight: 500;
          }
        }

        ${sharedStyles} etools-status {
          justify-content: center;
        }
        .flag {
          color: #ffffff;
          background-color: #75c8ff;
          padding: 5px 20px;
          width: 100%;
          border-radius: 7%;
        }
        div[slot='tabs'] {
          width: 100%;
        }
      </style>

      <intervention-page-content-header with-tabs-visible>
        <h1 slot="page-title">${this.intervention.number}</h1>
        <div slot="mode">
          <paper-toggle-button id="commentMode" ?checked="${this.commentMode}">Comment Mode</paper-toggle-button>
        </div>

        <div slot="statusFlag" ?hidden="${!this.intervention.accepted}">
          <span class="icon flag">Accepted</span>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <intervention-actions
            .interventionId="${this.intervention.id}"
            .actions="${this.availableActions}"
          ></intervention-actions>
        </div>

        <div slot="tabs">
          <etools-status-lit
            .statuses="${this.intervention.status_list || MOCKUP_STATUSES}"
            .activeStatus="${this.intervention.status}"
          ></etools-status-lit>

          <etools-tabs-lit
            .tabs="${this.pageTabs}"
            .activeTab="${this.activeTab}"
            @iron-select="${this.handleTabChange}"
          ></etools-tabs-lit>
        </div>
      </intervention-page-content-header>

      <div class="page-content">
        <intervention-details ?hidden="${!this.isActiveTab(this.activeTab, 'details')}"> </intervention-details>
        <intervention-overview ?hidden="${!this.isActiveTab(this.activeTab, 'overview')}"> </intervention-overview>
        <intervention-results ?hidden="${!this.isActiveTab(this.activeTab, 'results')}"> </intervention-results>
        <intervention-timing ?hidden="${!this.isActiveTab(this.activeTab, 'timing')}"> </intervention-timing>
        <intervention-management ?hidden="${!this.isActiveTab(this.activeTab, 'management')}">
        </intervention-management>
        <intervention-attachments ?hidden="${!this.isActiveTab(this.activeTab, 'attachments')}">
        </intervention-attachments>
        <intervention-reports ?hidden="${!this.isActiveTab(this.activeTab, 'reports')}"></intervention-reports>
        <intervention-progress ?hidden="${!this.isActiveTab(this.activeTab, 'progress')}"></intervention-progress>
      </div>
    `;
  }

  @property({type: Array})
  pageTabs = [
    {
      tab: 'overview',
      tabLabel: 'Overview',
      hidden: false
    },
    {
      tab: 'details',
      tabLabel: 'Details',
      hidden: false
    },
    {
      tab: 'results',
      tabLabel: 'Results',
      hidden: false
    },
    {
      tab: 'timing',
      tabLabel: 'Timing',
      hidden: false
    },
    {
      tab: 'management',
      tabLabel: 'Management',
      hidden: false
    },
    {
      tab: 'attachments',
      tabLabel: 'Attachments',
      hidden: false
    }
  ];

  @property({type: String})
  activeTab = 'details';

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Boolean})
  commentMode = false;

  @property()
  availableActions: string[] = [];

  _storeUnsubscribe!: () => void;
  _store!: AnyObject;

  @property({type: Object})
  get store() {
    return this._store;
  }

  set store(parentAppReduxStore: any) {
    setStore(parentAppReduxStore);
    this._storeUnsubscribe = getStore().subscribe(() => this.stateChanged(getStore().getState()));
    this.stateChanged(getStore().getState());
    this._store = parentAppReduxStore;
  }

  /*
   * Used to avoid unnecessary get intervention request
   */
  _routeDetails!: RouteDetails;

  connectedCallback() {
    super.connectedCallback();
    this._showInterventionPageLoadingMessage();
  }

  disconnectedCallback() {
    this._storeUnsubscribe();
    super.disconnectedCallback();
  }

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: RootState) {
    if (currentPage(state) === 'interventions' && currentSubpage(state) !== 'list') {
      this.activeTab = currentSubpage(state) as string;

      const currentInterventionId = get(state, 'app.routeDetails.params.interventionId');
      const currentIntervention = get(state, 'interventions.current');
      if (currentInterventionId !== String(get(this.intervention, 'id'))) {
        if (currentIntervention) {
          if (!isJsonStrMatch(this.intervention, currentIntervention)) {
            this.intervention = cloneDeep(currentIntervention);
          }
        }
        if (!isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)) {
          this._routeDetails = cloneDeep(state.app!.routeDetails);
          getStore().dispatch(getIntervention(currentInterventionId));
        }
      }
      this.availableActions = selectAvailableActions(state);

      // Progress, Reports tabs are visible only for unicef users
      if (get(state, 'user.data.is_unicef_user') && !this.pageTabs.find((x) => x.tab === 'progress')) {
        this.pageTabs.push({tab: 'progress', tabLabel: 'Progress', hidden: false});
        this.pageTabs.push({tab: 'reports', tabLabel: 'Reports', hidden: false});
      }
    }
  }

  handleTabChange(e: CustomEvent) {
    const newTabName: string = e.detail.item.getAttribute('name');
    if (newTabName === this.activeTab) {
      return;
    }
    this.tabChanged(newTabName, this.activeTab);
  }

  tabChanged(newTabName: string, oldTabName: string | undefined) {
    if (oldTabName === undefined) {
      // page load, tab init, component is gonna be imported in loadPageComponents action
      return;
    }
    if (newTabName !== oldTabName) {
      const tabControl = this.shadowRoot!.querySelector(`intervention-${newTabName}`);
      if (tabControl && !tabControl.shadowRoot) {
        // show loading message if tab was not already loaded
        this._showInterventionPageLoadingMessage();
      }

      const newPath = `interventions/${this.intervention.id}/${newTabName}`;
      history.pushState(window.history.state, '', newPath);
      // Don't know why I have to specifically trigger popstate,
      // history.pushState should do that by default (?)
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  _showInterventionPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'interv-page'
    });
  }
}
