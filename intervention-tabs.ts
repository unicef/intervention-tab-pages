import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button';

import './common/layout/page-content-header/intervention-page-content-header';
import './common/layout/etools-tabs';
// eslint-disable-next-line max-len
import './common/layout/status/etools-status';

import {customElement, LitElement, html, property, css} from 'lit-element';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {setStore, getStore} from './utils/redux-store-access';
import {currentPage, currentSubpage} from './common/selectors';
import {elevationStyles} from './common/styles/elevation-styles';
import {AnyObject, RouteDetails} from './common/models/globals.types';
import {getIntervention} from './common/actions';
import {sharedStyles} from './common/styles/shared-styles-lit';
import {isJsonStrMatch} from './utils/utils';
import {pageContentHeaderSlottedStyles} from './common/layout/page-content-header/page-content-header-slotted-styles';

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
    // main template
    // language=HTML
    return html`
      <style>
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
      </style>
      <etools-status-lit></etools-status-lit>

      <intervention-page-content-header with-tabs-visible>
        <h1 slot="page-title">${this.intervention.number}</h1>
        <div slot="mode">
          <paper-toggle-button id="commentMode" ?checked="${this.commentMode}">Comment Mode</paper-toggle-button>
        </div>

        <div slot="statusFlag" ?hidden="${!this.intervention.accepted}">
          <span class="icon flag">Accepted</span>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <paper-button raised>Action 1</paper-button>
          <paper-button raised>Action 2</paper-button>
        </div>

        <etools-tabs-lit
          slot="tabs"
          .tabs="${this.pageTabs}"
          .activeTab="${this.activeTab}"
          @iron-select="${this.handleTabChange}"
        ></etools-tabs-lit>
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
  }

  disconnectedCallback() {
    this._storeUnsubscribe();
    super.disconnectedCallback();
  }

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: any) {
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
      const newPath = `interventions/${this.intervention.id}/${newTabName}`;
      history.pushState(window.history.state, '', newPath);
      // Don't know why I have to specifically trigger popstate,
      // history.pushState should do that by default (?)
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }
}
