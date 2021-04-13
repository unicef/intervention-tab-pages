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
import {selectAvailableActions, currentPage, currentSubpage, isUnicefUser, currentSubSubpage} from './common/selectors';
import {elevationStyles} from './common/styles/elevation-styles';
import {RootState} from './common/types/store.types';
import {getIntervention, updateCurrentIntervention} from './common/actions/interventions';
import {sharedStyles} from './common/styles/shared-styles-lit';
import {isJsonStrMatch} from './utils/utils';
import {pageContentHeaderSlottedStyles} from './common/layout/page-content-header/page-content-header-slotted-styles';
import {fireEvent} from './utils/fire-custom-event';
import {buildUrlQueryString} from './utils/utils';
import {enableCommentMode, getComments} from './common/components/comments/comments.actions';
import {commentsData} from './common/components/comments/comments.reducer';
import {Store} from 'redux';
import {connectStore} from './common/mixins/connect-store-mixin';
import {Intervention} from '@unicef-polymer/etools-types';
import {AsyncAction, RouteDetails} from '@unicef-polymer/etools-types';
import {interventions} from './common/reducers/interventions';
import {translate, get as getTranslation} from 'lit-translate';

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
          --ecp-header-bg: #ffffff;
          --ecp-header-color: var(--primary-text-color);
        }

        ${sharedStyles} etools-status {
          justify-content: center;
        }
        .flag {
          color: #ffffff;
          background-color: #52c2e6;
          padding: 5px 20px;
          width: 100%;
          border-radius: 8px 8px;
        }
        div[slot='tabs'] {
          width: 100%;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <!-- Loading PRP country data -->
      <prp-country-data></prp-country-data>

      <intervention-page-content-header with-tabs-visible>
        <span slot="page-title">${this.intervention.number}</span>
        <div slot="mode">
          <paper-toggle-button id="commentMode" ?checked="${this.commentMode}" @iron-change="${this.commentModeChange}"
            >${translate('GENERAL.COMMENT_MODE')}</paper-toggle-button
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
            .activeSubTab="${this.activeSubTab}"
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
        <intervention-review ?hidden="${!this.isActiveTab(this.activeTab, 'review')}"></intervention-review>
        <intervention-attachments ?hidden="${!this.isActiveTab(this.activeTab, 'attachments')}">
        </intervention-attachments>
        <intervention-reports ?hidden="${!this.isActiveTab(this.activeTab, 'reports')}"></intervention-reports>
        <intervention-progress ?hidden="${!this.isActiveTab(this.activeTab, 'progress')}"></intervention-progress>
        <intervention-info .activeSubTab="${this.activeSubTab}" ?hidden="${!this.isActiveTab(this.activeTab, 'info')}"></intervention-info>
      </div>
    `;
  }

  @property({type: Array})
  pageTabs = [
    {
      tab: 'overview',
      tabLabel: (translate('INTERVENTION_TABS.OVERVIEW_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'details',
      tabLabel: (translate('INTERVENTION_TABS.DETAILS_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'results',
      tabLabel: (translate('INTERVENTION_TABS.RESULTS_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'timing',
      tabLabel: (translate('INTERVENTION_TABS.TIMING_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'management',
      tabLabel: (translate('INTERVENTION_TABS.MANAGEMENT_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'attachments',
      tabLabel: (translate('INTERVENTION_TABS.ATTACHMENTS_TAB') as unknown) as string,
      hidden: false
    },
    {
      tab: 'info',
      tabLabel: (translate('INTERVENTION_TABS.INFO_TAB') as unknown) as string,
      hidden: false,
      disabled: true,
      subtabs: [
        {label: 'Summary', value: 'summary'},
        {label: 'Implementation Status', value: 'implementation-status'},
        {label: 'Monitoring Activities', value: 'monitoring-activities'},
        {label: 'Results Reported', value: 'progress'},
        {label: 'Reports', value: 'reports'},
      ],
    }
  ];

  @property({type: String})
  activeTab = 'details';

  @property({type: String})
  activeSubTab = '';

  @property({type: Object})
  intervention!: Intervention | null;

  @property({type: Boolean})
  commentMode = false;

  @property()
  availableActions: string[] = [];

  @property({type: Boolean})
  isUnicefUser = false;

  /*
   * Used to avoid unnecessary get intervention request
   */
  _routeDetails: RouteDetails | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._showInterventionPageLoadingMessage();
    getStoreAsync().then((store: Store<RootState>) => {
      (store as any).addReducers({
        commentsData,
        interventions
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
      this.activeSubTab = currentSubSubpage(state) as string;
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
        getStore()
          .dispatch<AsyncAction>(getIntervention(currentInterventionId))
          .catch((err: any) => {
            if (err.message === '404') {
              this.goToPageNotFound();
            }
          });
        getStore().dispatch<AsyncAction>(getComments(currentInterventionId));
      }
      if (!isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)) {
        this._routeDetails = cloneDeep(state.app!.routeDetails);
        this.commentMode = !!(this._routeDetails?.queryParams || {})['comment_mode'];
        setTimeout(() => {
          getStore().dispatch(enableCommentMode(this.commentMode));
        }, 10);
        fireEvent(this, 'scroll-up');
      }
      this.availableActions = selectAvailableActions(state);
      this.checkReviewTab(state);
      // Progress, Reports tabs are visible only for unicef users if flag prp_mode_off it's not ON
      const envFlags = get(state, 'commonData.envFlags');
      if (
        get(state, 'user.data.is_unicef_user') &&
        envFlags &&
        !envFlags.prp_mode_off &&
        !this.pageTabs.find((x) => x.tab === 'progress')
      ) {
        // this.pageTabs.push({
        //   tab: 'progress',
        //   tabLabel: (translate('INTERVENTION_TABS.PROGRESS_TAB') as unknown) as string,
        //   hidden: false
        // });
        // this.pageTabs.push({
        //   tab: 'reports',
        //   tabLabel: (translate('INTERVENTION_TABS.REPORTS_TAB') as unknown) as string,
        //   hidden: false
        // });
      }
    } else if (this._routeDetails) {
      this._routeDetails = null;
      fireEvent(this, 'scroll-up');
      this.intervention = null;
      getStore().dispatch(updateCurrentIntervention(null));
    }
  }

  checkReviewTab(state: RootState): void {
    const tabIndex = this.pageTabs.findIndex((x) => x.tab === 'review');
    const unicefUser = get(state, 'user.data.is_unicef_user');
    if (tabIndex === -1 && unicefUser) {
      this.pageTabs.splice(5, 0, {
        tab: 'review',
        tabLabel: getTranslation('INTERVENTION_REVIEWS.REVIEW_TAB'),
        hidden: false
      });
    }
  }

  showPerformedActionsStatus() {
    return (
      ['draft', 'development'].includes(this.intervention!.status) &&
      (this.intervention!.partner_accepted ||
        this.intervention!.unicef_accepted ||
        (!this.intervention!.unicef_court && !!this.intervention!.date_sent_to_partner) ||
        (this.intervention!.unicef_court &&
          !!this.intervention!.submission_date &&
          !!this.intervention!.date_sent_to_partner))
    );
  }

  getPerformedAction() {
    if (!['draft', 'development'].includes(this.intervention!.status)) {
      return '';
    }
    if (this.intervention!.partner_accepted && this.intervention!.unicef_accepted) {
      return translate('PERFORMED_ACTIONS_STATUS.PARTNER_AND_UNICEF_ACCEPTED');
    }
    if (!this.intervention!.partner_accepted && this.intervention!.unicef_accepted) {
      return translate('PERFORMED_ACTIONS_STATUS.UNICEF_ACCEPTED');
    }
    if (this.intervention!.partner_accepted && !this.intervention!.unicef_accepted) {
      return translate('PERFORMED_ACTIONS_STATUS.PARTNER_ACCEPTED');
    }
    if (!this.intervention!.unicef_court && !!this.intervention!.date_sent_to_partner) {
      return translate('PERFORMED_ACTIONS_STATUS.SENT_TO_PARTNER');
    }

    if (
      this.intervention!.unicef_court &&
      !!this.intervention!.submission_date &&
      !!this.intervention!.date_sent_to_partner
    ) {
      return translate('PERFORMED_ACTIONS_STATUS.SENT_TO_UNICEF');
    }
    return '';
  }

  handleTabChange(e: CustomEvent) {
    const isSubtabParent = e.detail.item.getAttribute('is-subtabs-parent');
    if (isSubtabParent) {
      return;
    }
    const newTabName: string = e.detail.item.getAttribute('name');
    const newSubTab = e.detail.item.getAttribute('subtab');
    if (newTabName === this.activeTab && newSubTab === this.activeSubTab) {
      return;
    }
    this.tabChanged(newTabName, this.activeTab, newSubTab, this.activeSubTab);
  }

  tabChanged(newTabName: string, oldTabName: string | undefined,
    newSubTab: string, oldSubTab: string) {
    if (oldTabName === undefined) {
      // page load, tab init, component is gonna be imported in loadPageComponents action
      return;
    }
    if (newTabName !== oldTabName || newSubTab != oldSubTab) {
      const tabControl = this.shadowRoot!.querySelector(`intervention-${newTabName}`);
      if (tabControl && !tabControl.shadowRoot) {
        // show loading message if tab was not already loaded
        this._showInterventionPageLoadingMessage();
      }

      let newPath = this._geNewUrlPath(newTabName, newSubTab);

      history.pushState(window.history.state, '', newPath);
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  _geNewUrlPath(newTabName: string, newSubTab: string) {
    const stringParams: string = buildUrlQueryString(this._routeDetails!.queryParams || {});
    let newPath =
      `interventions/${this.intervention!.id}/${newTabName}`;
    if (newSubTab) {
      newPath += `/${newSubTab}`;
    } else {
      this.activeSubTab = '';
    }
    newPath += (stringParams !== '' ? `?${stringParams}` : '');

    return newPath;
  }

  goToPageNotFound() {
    history.pushState(window.history.state, '', 'page-not-found');
    window.dispatchEvent(new CustomEvent('popstate'));
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
