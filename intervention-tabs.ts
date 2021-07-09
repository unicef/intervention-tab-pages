import '@polymer/paper-button/paper-button';
import '@polymer/paper-toggle-button';

import '../../common/layout/page-content-header/intervention-page-content-header';
import '../../common/layout/etools-tabs';
import './common/components/cancel/cancel-justification';
// eslint-disable-next-line max-len
import '../../common/layout/status/etools-status';
import './intervention-actions/intervention-actions';
import './common/components/prp-country-data/prp-country-data';
import {customElement, LitElement, html, property, css, query} from 'lit-element';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {getStore, getStoreAsync} from '../../common/utils/redux-store-access';
import {currentPage, currentSubpage, isUnicefUser, currentSubSubpage, currentUser} from './common/selectors';
import {elevationStyles} from '../../common/styles/elevation-styles';
import {RootState} from './common/types/store.types';
import {getIntervention} from './common/actions/interventions';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {isJsonStrMatch} from '../../common/utils/utils';
import {pageContentHeaderSlottedStyles} from '../../common/layout/page-content-header/page-content-header-slotted-styles';
import {fireEvent} from '../../common/utils/fire-custom-event';
import {buildUrlQueryString} from '../../common/utils/utils';
import {enableCommentMode, getComments} from './common/components/comments/comments.actions';
import {commentsData} from './common/components/comments/comments.reducer';
import {Store} from 'redux';
import {connectStore} from '../../common/mixins/connect-store-mixin';
import {EnvFlags, Intervention} from '@unicef-polymer/etools-types';
import {AsyncAction, RouteDetails} from '@unicef-polymer/etools-types';
import {interventions} from './common/reducers/interventions';
import {translate, get as getTranslation} from 'lit-translate';
import {EtoolsTabs} from '../../common/layout/etools-tabs';
import {ROOT_PATH} from '../../common/config/config';
import {reviews} from './common/reducers/officers-reviews';
import {uploadStatus} from './common/reducers/upload-status';
import {TABS} from './common/constants';
import UploadMixin from '../../common/mixins/uploads-mixin';
import '../../common/layout/are-you-sure';
import {openDialog} from '../../common/utils/dialog';
import {RESET_UNSAVED_UPLOADS, RESET_UPLOADS_IN_PROGRESS} from './common/actions/actionsContants';

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
export class InterventionTabs extends connectStore(UploadMixin(LitElement)) {
  static get styles() {
    // language=css
    return [
      elevationStyles,
      pageContentHeaderSlottedStyles,
      css`
        :host {
          flex: 1;
          display: flex !important;
          width: 100%;
          flex-direction: column;
        }
        :host([is-in-amendment]) {
          border: 5px solid #ffd28b;
          box-sizing: border-box;
        }
        .page-content {
          margin: 24px;
          flex: 1;
        }
        .amendment-info {
          position: sticky;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          background-color: #ffd28b;
          height: 50px;
        }
        .amendment-info a {
          margin-left: 7px;
          cursor: pointer;
          text-decoration: underline;
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
          color: var(--primary-text-color);
          background-color: whitesmoke;
          padding: 5px 0;
          padding-inline-end: 14px;
          padding-inline-start: 10px;
          width: 100%;
          border-radius: 25px;
        }
        .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          background-color: #52c2e6;
          border-radius: 50%;
          margin-inline-end: 3px;
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
          <span class="icon flag">
            <span class="dot"></span>
            ${this.getPerformedAction()}
          </span>
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
            @iron-activate="${this.handleTabActivate}"
          ></etools-tabs-lit>
        </div>
      </intervention-page-content-header>

      <div class="page-content">
        ${this.intervention.cancel_justification
          ? html`<cancel-justification .justification=${this.intervention.cancel_justification}></cancel-justification>`
          : ''}
        <intervention-metadata ?hidden="${!this.isActiveTab(this.activeTab, 'metadata')}"> </intervention-metadata>
        <intervention-strategy ?hidden="${!this.isActiveTab(this.activeTab, 'strategy')}"></intervention-strategy>
        <intervention-workplan ?hidden="${!this.isActiveTab(this.activeTab, 'workplan')}"> </intervention-workplan>
        <intervention-timing ?hidden="${!this.isActiveTab(this.activeTab, 'timing')}"> </intervention-timing>
        <intervention-review ?hidden="${!this.isActiveTab(this.activeTab, 'review')}"></intervention-review>
        <intervention-attachments ?hidden="${!this.isActiveTab(this.activeTab, 'attachments')}">
        </intervention-attachments>
        <intervention-progress
          .activeSubTab="${this.activeSubTab}"
          ?hidden="${!this.isActiveTab(this.activeTab, TABS.Progress)}"
        ></intervention-progress>
      </div>

      <div class="amendment-info" ?hidden="${!this.isInAmendment}">
        ${translate('AMENDMENT_MODE_TEXT')}
        <a href="${ROOT_PATH}interventions/${this.intervention?.original_intervention}/metadata">
          ${translate('ORIGINAL_VERSION')}
        </a>
      </div>
    `;
  }

  @property({type: Array})
  pageTabs = [
    {
      tab: TABS.Metadata,
      tabLabel: getTranslation('METADATA_TAB'),
      hidden: false
    },
    {
      tab: TABS.Strategy,
      tabLabel: getTranslation('STRATEGY_TAB'),
      hidden: false
    },
    {
      tab: TABS.Workplan,
      tabLabel: getTranslation('WORKPLAN_TAB'),
      hidden: false
    },
    {
      tab: TABS.Timing,
      tabLabel: (getTranslation('TIMING_TAB') as unknown) as string,
      hidden: false
    }
  ];

  progressTabTemplate = {
    tab: TABS.Progress,
    tabLabel: getTranslation('PROGRESS_TAB'),
    hidden: false,
    disabled: true,
    subtabs: [
      {label: getTranslation('IMPLEMENTATION_STATUS_SUBTAB'), value: TABS.ImplementationStatus},
      {label: getTranslation('MONITORING_ACTIVITIES_SUBTAB'), value: TABS.MonitoringActivities}
    ]
  };

  @property({type: String})
  activeTab = TABS.Metadata;

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

  @property({type: Boolean, attribute: 'is-in-amendment', reflect: true})
  isInAmendment = false;

  @query('etools-tabs-lit')
  etoolsTabs!: EtoolsTabs;

  /*
   * Used to avoid unnecessary get intervention request
   */
  _routeDetails: RouteDetails | null = null;

  // id from route params
  private interventionId: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._showInterventionPageLoadingMessage();
    getStoreAsync().then((store: Store<RootState>) => {
      (store as any).addReducers({
        commentsData,
        interventions,
        reviews,
        uploadStatus
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
    const notInterventionTabs: boolean = currentPage(state) !== 'interventions' || currentSubpage(state) === 'list';
    const needToReset = Boolean(notInterventionTabs && (this._routeDetails || this.intervention));
    if (needToReset) {
      this.resetPageData();
    }
    if (notInterventionTabs || state.interventions?.interventionLoading || !currentUser(state)) {
      return;
    }

    this.activeTab = currentSubpage(state) as string;
    this.activeSubTab = currentSubSubpage(state) as string;
    this.isUnicefUser = isUnicefUser(state);

    // check permissions after intervention was loaded
    if (state.interventions?.current && !this.hasPermissionsToAccessPage(state)) {
      this.goToPageNotFound();
      return;
    }
    const currentInterventionId = get(state, 'app.routeDetails.params.interventionId');
    const currentIntervention = get(state, 'interventions.current');

    // check if intervention was changed
    if (!isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this.availableActions = this.intervention?.available_actions || [];
      // set amendment attribute on host to add border and other styles
      this.isInAmendment = Boolean(this.intervention?.in_amendment);
      this.checkTabs(state);
    }

    // check if we need to load intervention and comments
    if (currentInterventionId !== this.interventionId) {
      this.interventionId = currentInterventionId;
      this.loadInterventionData(currentInterventionId);
    }

    if (get(state, 'uploadStatus')) {
      this.uploadsStateChanged(state);
    }

    // on routing change
    if (!isJsonStrMatch(state.app!.routeDetails!, this._routeDetails)) {
      this._routeDetails = cloneDeep(state.app!.routeDetails);
      this.commentMode = Boolean(this._routeDetails?.queryParams?.comment_mode);
      setTimeout(() => {
        getStore().dispatch(enableCommentMode(this.commentMode));
      }, 10);
      fireEvent(this, 'scroll-up');
    }
  }

  hasPermissionsToAccessPage(state: RootState) {
    const unicefUser = isUnicefUser(state);
    const tab = currentSubpage(state);
    const subTab = currentSubSubpage(state);

    const attachmentRestricted =
      tab === TABS.Attachments && !state.interventions.current?.permissions?.view!.attachments;

    const reviewRestricted = tab === TABS.Review && !state.interventions.current?.permissions?.view!.reviews;
    const restrictedSubTabs =
      !unicefUser &&
      [TABS.ResultsReported, TABS.Reports, TABS.ImplementationStatus, TABS.MonitoringActivities].includes(subTab);
    return !attachmentRestricted && !reviewRestricted && !restrictedSubTabs;
  }

  checkTabs(state: RootState): void {
    this.checkAttachmentsTab(state);
    this.checkReviewTab(state);

    this.handleProgressTabVisibility(state.commonData?.envFlags, state?.user.data?.is_unicef_user);
    this.pageTabs = [...this.pageTabs];
  }

  handleProgressTabVisibility(envFlags: EnvFlags | null, isUnicefUser?: boolean) {
    if (!isUnicefUser) {
      return; // ONLY visible for unicef users
    }

    let progressTab = this.pageTabs.find((x) => x.tab === TABS.Progress);
    if (progressTab) {
      // tab already configured
      return;
    } else {
      progressTab = cloneDeep(this.progressTabTemplate);
    }
    // Results Reported, Reports tabs are visible only for unicef users if flag prp_mode_off is not ON
    if (envFlags && !envFlags.prp_mode_off && !progressTab?.subtabs?.find((t) => t.value === TABS.ResultsReported)) {
      progressTab?.subtabs?.push(
        {label: getTranslation('RESULTS_REPORTED_SUBTAB'), value: TABS.ResultsReported},
        {label: getTranslation('REPORTS_SUBTAB'), value: TABS.Reports}
      );
    }
    this.pageTabs.push(progressTab);
  }

  checkReviewTab(state: RootState): void {
    const tabIndex = this.pageTabs.findIndex((x) => x.tab === 'review');
    const unicefUser = get(state, 'user.data.is_unicef_user');
    if (tabIndex === -1 && unicefUser) {
      const pasteTo = this.pageTabs.findIndex((x) => x.tab === TABS.Progress);
      this.pageTabs.splice(pasteTo, 0, {
        tab: TABS.Review,
        tabLabel: getTranslation('REVIEW_TAB'),
        hidden: false
      });
    }
  }

  checkAttachmentsTab(state: RootState): void {
    const tabIndex = this.pageTabs.findIndex((x) => x.tab === 'attachments');
    const canView = get(state, 'interventions.current.permissions.view.attachments');
    if (tabIndex === -1 && canView) {
      const pasteTo = this.pageTabs.findIndex((x) => x.tab === TABS.Progress);
      this.pageTabs.splice(pasteTo, 0, {
        tab: TABS.Attachments,
        tabLabel: (getTranslation('ATTACHMENTS_TAB') as unknown) as string,
        hidden: false
      });
    } else if (tabIndex !== -1 && !canView) {
      this.pageTabs.splice(tabIndex, 1);
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
      return translate('PARTNER_AND_UNICEF_ACCEPTED');
    }
    if (!this.intervention!.partner_accepted && this.intervention!.unicef_accepted) {
      return translate('UNICEF_ACCEPTED');
    }
    if (this.intervention!.partner_accepted && !this.intervention!.unicef_accepted) {
      return translate('PARTNER_ACCEPTED');
    }
    if (!this.intervention!.unicef_court && !!this.intervention!.date_sent_to_partner) {
      return translate('SENT_TO_PARTNER');
    }

    if (
      this.intervention!.unicef_court &&
      !!this.intervention!.submission_date &&
      !!this.intervention!.date_sent_to_partner
    ) {
      return translate('SENT_TO_UNICEF');
    }
    return '';
  }

  handleTabActivate(e: CustomEvent) {
    if (this.existsUnsavedUploads(e)) {
      e.preventDefault();
      return;
    }
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
    this.fixIntermittent2TabsUnderlined(this.etoolsTabs);
  }

  existsUnsavedUploads(e: CustomEvent) {
    if (Number(this.uploadsInProgress) > 0 || Number(this.unsavedUploads) > 0) {
      this.confirmLeaveUploadsUnsavedDialog(e);
      return true;
    }
    return false;
  }

  async confirmLeaveUploadsUnsavedDialog(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('LEAVE_UPLOADS_UNSAVED'),
        confirmBtnText: translate('LEAVE'),
        cancelBtnText: translate('STAY')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
    if (confirmed) {
      getStore().dispatch({type: RESET_UNSAVED_UPLOADS});
      getStore().dispatch({type: RESET_UPLOADS_IN_PROGRESS});
      this.handleTabChange(e);
    }
  }

  fixIntermittent2TabsUnderlined(etoolsTabs: EtoolsTabs) {
    if (this.activeSubTab) {
      setTimeout(() => etoolsTabs.notifyResize());
    }
  }

  tabChanged(newTabName: string, oldTabName: string | undefined, newSubTab: string, oldSubTab: string) {
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

      const newPath = this._geNewUrlPath(newTabName, newSubTab);

      history.pushState(window.history.state, '', newPath);
      window.dispatchEvent(new CustomEvent('popstate'));
    }
  }

  _geNewUrlPath(newTabName: string, newSubTab: string) {
    const stringParams: string = buildUrlQueryString(this._routeDetails!.queryParams || {});
    let newPath = `interventions/${this.intervention!.id}/${newTabName}`;
    if (newSubTab) {
      newPath += `/${newSubTab}`;
    } else {
      this.activeSubTab = '';
    }
    newPath += stringParams !== '' ? `?${stringParams}` : '';

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

  private resetPageData(): void {
    fireEvent(this, 'scroll-up');
    this._routeDetails = null;
    this.intervention = null;
    this.interventionId = null;
    this.isInAmendment = false;
  }

  private loadInterventionData(currentInterventionId: string | number): void {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'intervention-tabs'
    });
    getStore()
      .dispatch<AsyncAction>(getIntervention(String(currentInterventionId)))
      .catch((err: any) => {
        if (err.message === '404') {
          this.goToPageNotFound();
        }
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'intervention-tabs'
        })
      );
    getStore().dispatch<AsyncAction>(getComments(Number(currentInterventionId)));
  }
}
