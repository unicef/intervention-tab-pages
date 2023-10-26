import {CSSResultArray, LitElement, TemplateResult, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {arrowLeftIcon} from '@unicef-polymer/etools-modules-common/dist/styles/app-icons';
import '../common/layout/export-intervention-data';
import '@unicef-polymer/etools-modules-common/dist/components/cancel/reason-popup';
import './accept-for-partner';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import '../common/components/intervention/pd-termination';
import '../common/components/intervention/start-review';
import '../common/components/intervention/review-checklist-popup';
import {InterventionActionsStyles} from './intervention-actions.styles';
import {
  ACCEPT_REVIEW,
  ACTIONS_WITH_INPUT,
  AMENDMENT_MERGE,
  BACK_ACTIONS,
  CANCEL,
  EXPORT_ACTIONS,
  ActionNamesMap,
  SEND_TO_PARTNER,
  SEND_TO_UNICEF,
  SIGNATURE,
  TERMINATE,
  ACTIONS_WITHOUT_CONFIRM,
  PRC_REVIEW,
  REJECT_REVIEW,
  REVIEW,
  SIGN,
  ACCEPT_ON_BEHALF_OF_PARTNER,
  SIGN_BUDGET_OWNER,
  SEND_BACK_REVIEW,
  UNLOCK
} from './intervention-actions.constants';
import {setShouldReGetList, updateCurrentIntervention} from '../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {
  defaultKeyTranslate,
  formatServerErrorAsText
} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {AnyObject, EtoolsEndpoint, GenericObject} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {translatesMap} from '../utils/intervention-labels-map';
import {RootState} from '../common/types/store.types';
import {buttonsStyles} from '@unicef-polymer/etools-unicef/src/styles/button-styles';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';

@customElement('intervention-actions')
export class InterventionActions extends connectStore(LitElement) {
  static get styles(): CSSResultArray {
    return [
      InterventionActionsStyles,
      buttonsStyles,
      css`
        sl-button[slot='trigger'] {
          min-width: 45px;
          width: 45px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
          --sl-spacing-medium: 0;
        }
      `
    ];
  }

  @property() actions: string[] = [];
  @property({type: String}) dir = 'ltr';
  @property({type: Object})
  interventionPartial!: Partial<Intervention>;

  @property({type: Boolean})
  userIsBudgetOwner = false;

  @property({type: Number})
  commonDataLoadedTimestamp = 0;

  private isEPDApp = ROOT_PATH === '/epd/';

  connectedCallback() {
    super.connectedCallback();
    this.dir = getComputedStyle(document.body).direction;
  }

  private actionsNamesMap = new Proxy(ActionNamesMap, {
    get(target: AnyObject, property: string): string {
      return target[property] && target[property].text ? target[property].text : property.replace('_', ' ');
    }
  });

  protected render(): TemplateResult {
    const actions: Set<string> = new Set(this.actions);
    const exportActions: string[] = EXPORT_ACTIONS.filter((action: string) => actions.has(action));
    const backAction: string | undefined = BACK_ACTIONS.find((action: string) => actions.has(action));
    const [mainAction, ...groupedActions] = this.actions.filter(
      (action: string) => !exportActions.includes(action) && action !== backAction
    );
    return html`
      ${this.renderBackAction(backAction)}${this.renderGroupedActions(mainAction, groupedActions)}
      ${this.renderExport(exportActions)}
    `;
  }

  private renderExport(actions: string[]): TemplateResult {
    // for ePD app must add ePD text on Export links
    const preparedExportActions = actions.map((action: string) => ({
      name: this.actionsNamesMap[this.isEPDApp ? `${action}_epd` : action],
      type: action
    }));
    return actions.length
      ? html`
          <export-intervention-data
            .exportLinks="${preparedExportActions}"
            .interventionId="${this.interventionPartial.id}"
          ></export-intervention-data>
        `
      : html``;
  }

  private renderBackAction(action?: string): TemplateResult {
    return action
      ? html`
          <sl-button variant="primary" class="back-button" @click="${() => this.processAction(action)}">
            ${arrowLeftIcon} <span>${this.actionsNamesMap[action]}</span>
          </sl-button>
        `
      : html``;
  }

  private renderGroupedActions(mainAction: string, actions: string[]): TemplateResult {
    const withAdditional = actions.length ? ' with-additional' : '';
    const onlyCancel = !actions.length && mainAction === CANCEL ? ` cancel-background` : '';
    const className = `main-button${withAdditional}${onlyCancel}`;
    return mainAction
      ? html`
          <sl-button variant="primary" class="${className} split-btn" @click="${() => this.processAction(mainAction)}">
            <span>${this.getMainActionTranslatedText(mainAction)}</span> ${this.getAdditionalTransitions(actions)}
          </sl-button>
        `
      : html``;
  }

  public stateChanged(state: RootState) {
    if (this.commonDataLoadedTimestamp !== state.commonData!.loadedTimestamp) {
      // static data reloaded (because of language change), need to update texts
      this.commonDataLoadedTimestamp = state.commonData!.loadedTimestamp;
      Object.keys(ActionNamesMap).forEach(
        (key) => (ActionNamesMap[key].text = getTranslation(ActionNamesMap[key].textKey))
      );
    }
  }

  private getAdditionalTransitions(actions?: string[]): TemplateResult {
    if (!actions || !actions.length) {
      return html``;
    }
    return html`
      <sl-dropdown @click="${(event: MouseEvent) => event.stopImmediatePropagation()}">
        <sl-button slot="trigger" variant="primary" size="small">
          <etools-icon name="expand-more"></etools-icon>
        </sl-button>
        <sl-menu>
          ${actions.map(
            (action: string) => html`
              <sl-menu-item @click="${() => this.processAction(action)}">
                ${this.actionsNamesMap[action]}
              </sl-menu-item>
            `
          )}
        </sl-menu>
      </sl-dropdown>
    `;
  }

  async confirmAction(action: string) {
    if (ACTIONS_WITHOUT_CONFIRM.includes(action)) {
      return true;
    }
    let message = '';
    let btn = '';
    switch (action) {
      case SIGNATURE:
        btn = getTranslation('SEND');
        message = getTranslation('SEND_FOR_SIGNATURE');
        break;
      case ACCEPT_REVIEW:
        btn = getTranslation('SEND');
        message = getTranslation('SEND_FOR_ACCEPT_REVIEW');
        break;
      case CANCEL:
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('CANCEL_PROMPT');
        break;
      case AMENDMENT_MERGE:
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('AMENDMENT_MERGE_PROMPT');
        break;
      case SEND_TO_PARTNER:
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('SEND_TO_PARTNER_PROMPT');
        break;
      case SEND_TO_UNICEF:
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('SEND_TO_UNICEF_PROMPT');
        break;
      case TERMINATE:
        btn = getTranslation('CONTINUE');
        message = getTranslation('TERMINATE_PROMPT');
        break;
      case REVIEW:
        btn = getTranslation('ACCEPT');
        message = getTranslation('REVIEW_PROMPT');
        break;
      case UNLOCK:
        btn = getTranslation('UNLOCK');
        message = getTranslation('UNLOCK_PROMPT');
        break;
      default:
        btn = this.actionsNamesMap[action];
        message = `${getTranslation('ARE_YOU_SURE_PROMPT')} ${this.getActionTextForPopup(action).toLowerCase()} ?`;
    }
    return await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: message,
        confirmBtnText: btn
      }
    }).then(({confirmed}) => confirmed);
  }

  // for popup cannot use translate from actionsNamesMap, need to pass a string and so will use getTranslation
  getActionTextForPopup(action: string): string {
    return ActionNamesMap[action] ? getTranslation(ActionNamesMap[action].textKey) : action;
  }

  async processAction(action: string): Promise<void> {
    this.closeDropdown();

    if (!(await this.confirmAction(action))) {
      return;
    }

    const body = this.isActionWithInput(action) ? await this.openActionsWithInputsDialogs(action) : {};
    if (body === null) {
      return;
    }

    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.interventionAction, {
      interventionId: this.interventionPartial.id,
      action
    });
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'intervention-actions'
    });
    sendRequest({
      endpoint,
      body,
      method: 'PATCH'
    })
      .then((intervention: Intervention) => {
        getStore().dispatch(setShouldReGetList(true));

        if (action === AMENDMENT_MERGE) {
          setTimeout(() => {
            this.redirectToTabPage(intervention.id, 'metadata');
          });
        } else {
          getStore().dispatch(updateCurrentIntervention(intervention));
        }

        if (action === REVIEW) {
          setTimeout(() => {
            this.redirectToTabPage(intervention.id, REVIEW);
          });
        }
      })
      .finally(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'intervention-actions'
        });
      })
      .catch((error: any) => {
        fireEvent(this, 'toast', {
          text: formatServerErrorAsText(error, (key) => {
            const labelKey = translatesMap[key];
            return labelKey ? getTranslation(labelKey) : defaultKeyTranslate(key);
          })
        });
      });
  }

  private isActionWithInput(action: string) {
    if (ACTIONS_WITH_INPUT.includes(action)) {
      if (action == ACCEPT_ON_BEHALF_OF_PARTNER) {
        if (this.interventionPartial.submission_date || this.interventionPartial.in_amendment) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  private redirectToTabPage(id: number | null, tabName: string) {
    history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${id}/${tabName}`);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  private openCommentDialog(action: string): Promise<any> {
    return openDialog({
      dialog: 'reason-popup',
      dialogData: {
        popupTitle: `${this.getActionTextForPopup(action)} ${getTranslation('REASON')}`,
        label: `${this.getActionTextForPopup(action)} ${getTranslation('COMMENT')}`
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      if (action === 'cancel') {
        return {cancel_justification: response.comment};
      }
      return null;
    });
  }

  private openSentBackBySecretaryCommentDialog(action: string): Promise<any> {
    return openDialog({
      dialog: 'reason-popup',
      dialogData: {
        popupTitle: `${this.getActionTextForPopup(action)} ${getTranslation('REASON')}`,
        label: `${this.getActionTextForPopup(action)} ${getTranslation('COMMENT')}`
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }

      return {sent_back_comment: response.comment};
    });
  }

  private openTermiantionDialog() {
    return openDialog({
      dialog: 'pd-termination',
      dialogData: {
        interventionId: this.interventionPartial.id
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      return {
        id: response.id,
        end: response.end,
        termination_doc_attachment: response.termination_doc_attachment
      };
    });
  }

  private openStartReviewDialog() {
    return openDialog({
      dialog: 'start-review'
    }).then(({confirmed, response}) => {
      if (!confirmed) {
        return null;
      }
      return {review_type: response};
    });
  }

  private openReviewDialog(additional?: GenericObject) {
    return openDialog({
      dialog: 'review-checklist-popup',
      dialogData: {
        isOverall: Boolean(additional),
        ...additional
      }
    }).then(({confirmed}) => {
      if (!additional) {
        return null;
      } else {
        return confirmed ? {} : null;
      }
    });
  }

  private openAcceptForPartner() {
    return openDialog({
      dialog: 'accept-for-partner',
      dialogData: {
        interventionId: this.interventionPartial.id
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return null;
      }
      return {
        submission_date: response.submission_date
      };
    });
  }

  private closeDropdown(): void {
    const element: SlDropdown | null = this.shadowRoot!.querySelector('sl-dropdown');
    if (element) {
      element.open = false;
    }
  }

  private openActionsWithInputsDialogs(action: string) {
    switch (action) {
      case CANCEL:
        return this.openCommentDialog(action);
      case SEND_BACK_REVIEW:
        return this.openSentBackBySecretaryCommentDialog(action);
      case TERMINATE:
        return this.openTermiantionDialog();
      case REVIEW:
        return this.openStartReviewDialog();
      case PRC_REVIEW:
        return this.openReviewDialog();
      case REJECT_REVIEW:
        return this.openReviewDialog({rejectPopup: true});
      case SIGN:
        return this.openReviewDialog({approvePopup: true});
      case ACCEPT_ON_BEHALF_OF_PARTNER:
        return this.openAcceptForPartner();
      default:
        return;
    }
  }

  private getMainActionTranslatedText(mainAction: string) {
    if (this.interventionPartial.status === 'review' && this.userIsBudgetOwner && mainAction === 'sign') {
      return this.actionsNamesMap[SIGN_BUDGET_OWNER];
    }
    return this.actionsNamesMap[mainAction];
  }
}
