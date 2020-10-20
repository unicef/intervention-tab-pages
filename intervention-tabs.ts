import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button';

import './common/layout/page-content-header/intervention-page-content-header';
import './common/layout/etools-tabs';
import './common/components/cancel/cancel-justification';
// eslint-disable-next-line max-len
import './common/layout/status/etools-status';
import './intervention-actions/intervention-actions';
import './common/components/prp-country-data/prp-country-data';
import {customElement, LitElement, html, property, css} from 'lit-element';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {getStore, getStoreAsync} from './utils/redux-store-access';
import {selectAvailableActions, currentPage, currentSubpage, isUnicefUser} from './common/selectors';
import {elevationStyles} from './common/styles/elevation-styles';
import {RouteDetails, RootState} from './common/models/globals.types';
import {getIntervention} from './common/actions';
import {sharedStyles} from './common/styles/shared-styles-lit';
import {isJsonStrMatch} from './utils/utils';
import {pageContentHeaderSlottedStyles} from './common/layout/page-content-header/page-content-header-slotted-styles';
import {fireEvent} from './utils/fire-custom-event';
import {buildUrlQueryString} from './utils/utils';
import {enableCommentMode, getComments} from './common/components/comments/comments.actions';
import {commentsData} from './common/components/comments/comments.reducer';
import {Intervention} from './common/models/intervention.types';
import {Store} from 'redux';
import {connectStore} from './common/mixins/connect-store-mixin';

const MOCKUP_STATUSES = [
  ['draft', 'Draft'],
  ['signed', 'Signed'],
  ['active', 'Active'],
  ['terminated', 'Terminated'],
  ['closed', 'Closed']
];
/**
 * @LitElement
 * @customElement
 */
@customElement('intervention-tabs')
export class InterventionTabs extends connectStore(LitElement) {
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
          --epc-header-color: var(--primary-text-color);
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

      <!-- Loading PRP country data -->
      <prp-country-data></prp-country-data>

      <intervention-page-content-header with-tabs-visible>
        <span slot="page-title">${this.intervention.number}</span>
        <div slot="mode">
          <paper-toggle-button id="commentMode" ?checked="${this.commentMode}" @iron-change="${this.commentModeChange}"
            >Comment Mode</paper-toggle-button
          >
        </div>

        <div slot="statusFlag" ?hidden="${!this.showPerformedActionsStatus()}">
          <span class="icon flag">${this.getPerformedAction()}</span>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <intervention-actions
            .interventionId="${this.intervention.id}"
            .activeStatus="${this.intervention.status}"
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
        ${this.intervention.cancel_justification
          ? html`<cancel-justification .justification=${this.intervention.cancel_justification}></cancel-justification>`
          : ''}
        <intervention-details ?hidden="${!this.isActiveTab(this.activeTab, 'details')}"> </intervention-details>
        <intervention-overview ?hidden="${!this.isActiveTab(this.activeTab, 'overview')}"></intervention-overview>
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
  intervention!: Intervention;

  @property({type: Boolean})
  commentMode = false;

  @property()
  availableActions: string[] = [];

  @property({type: Boolean})
  isUnicefUser = false;

  /*
   * Used to avoid unnecessary get intervention request
   */
  _routeDetails!: RouteDetails;

  connectedCallback() {
    super.connectedCallback();
    this._showInterventionPageLoadingMessage();
    getStoreAsync().then((store: Store<RootState>) => {
      (store as any).addReducers({
        commentsData
      });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  public stateChanged(state: RootState) {
    if (currentPage(state) === 'interventions' && currentSubpage(state) !== 'list') {
      this.activeTab = currentSubpage(state) as string;
      this.isUnicefUser = isUnicefUser(state);
      const currentInterventionId = get(state, 'app.routeDetails.params.interventionId');
      const currentIntervention = get(state, 'interventions.current');

      if (currentIntervention) {
        if (!isJsonStrMatch(this.intervention, currentIntervention)) {
          this.intervention = cloneDeep(currentIntervention);
        }
      }
      if (
        currentInterventionId !== String(get(this.intervention, 'id')) &&
        !isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)
      ) {
        getStore().dispatch(getIntervention(currentInterventionId));
        getStore().dispatch(getComments(currentInterventionId));
      }
      if (!isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)) {
        this._routeDetails = cloneDeep(state.app!.routeDetails);
        this.commentMode = !!(this._routeDetails.queryParams || {})['comment_mode'];
        getStore().dispatch(enableCommentMode(this.commentMode));
      }
      this.availableActions = selectAvailableActions(state);

      // Progress, Reports tabs are visible only for unicef users if flag prp_mode_off it's not ON
      const envFlags = get(state, 'commonData.envFlags');
      if (
        get(state, 'user.data.is_unicef_user') &&
        envFlags &&
        !envFlags.prp_mode_off &&
        !this.pageTabs.find((x) => x.tab === 'progress')
      ) {
        this.pageTabs.push({tab: 'progress', tabLabel: 'Progress', hidden: false});
        this.pageTabs.push({tab: 'reports', tabLabel: 'Reports', hidden: false});
      }
    }
  }

  showPerformedActionsStatus() {
    return (
      ['draft', 'development'].includes(this.intervention.status) &&
      (this.intervention.partner_accepted ||
        this.intervention.unicef_accepted ||
        (!this.intervention.unicef_court && !!this.intervention.date_sent_to_partner) ||
        (this.intervention.unicef_court && !!this.intervention.date_draft_by_partner))
    );
  }

  getPerformedAction() {
    if (!['draft', 'development'].includes(this.intervention.status)) {
      return '';
    }
    if (this.intervention.partner_accepted && this.intervention.unicef_accepted) {
      return 'IP & Unicef Accepted';
    }
    if (!this.intervention.partner_accepted && this.intervention.unicef_accepted) {
      return 'Unicef Accepted';
    }
    if (this.intervention.partner_accepted && !this.intervention.unicef_accepted) {
      return 'IP Accepted';
    }
    if (!this.intervention.unicef_court && !!this.intervention.date_sent_to_partner) {
      return 'Sent to Partner';
    }

    if (this.intervention.unicef_court && !!this.intervention.date_draft_by_partner) {
      return 'Sent to Unicef';
    }
    return '';
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

      const stringParams: string = buildUrlQueryString(this._routeDetails!.queryParams || {});
      const newPath =
        `interventions/${this.intervention.id}/${newTabName}` + (stringParams !== '' ? `?${stringParams}` : '');
      history.pushState(window.history.state, '', newPath);
      // Don't know why I have to specifically trigger popstate,
      // history.pushState should do that by default (?)
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  commentModeChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    const element = e.currentTarget as HTMLInputElement;
    // initial load
    if (element.checked === this.commentMode) {
      return;
    }
    history.pushState(window.history.state, '', this.computeNewPath(element.checked));
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  computeNewPath(commentMode: boolean) {
    const queryParams = {...(this._routeDetails!.queryParams || {})};
    if (commentMode) {
      queryParams['comment_mode'] = 'true';
    } else {
      delete queryParams['comment_mode'];
    }
    const stringParams: string = buildUrlQueryString(queryParams);
    return this._routeDetails!.path + (stringParams !== '' ? `?${stringParams}` : '');
  }

  _showInterventionPageLoadingMessage() {
    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'interv-page'
    });
  }
}
