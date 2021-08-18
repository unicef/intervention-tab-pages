/* eslint-disable lit-a11y/click-events-have-key-events */
import {CSSResultArray, LitElement, TemplateResult, html, property, customElement} from 'lit-element';
import {arrowLeftIcon} from '@unicef-polymer/etools-modules-common/dist/styles/app-icons';
import '@polymer/paper-button';
import '@polymer/paper-menu-button';
import '@polymer/paper-icon-button';
import '../common/layout/export-intervention-data';
import '@unicef-polymer/etools-modules-common/dist/components/cancel/reason-popup';
import './accept-for-partner';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
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
  namesMap,
  SEND_TO_PARTNER,
  SEND_TO_UNICEF,
  SIGNATURE,
  TERMINATE,
  ACTIONS_WITHOUT_CONFIRM,
  PRC_REVIEW,
  REJECT_REVIEW,
  REVIEW,
  SIGN,
  ACCEPT_ON_BEHALF_OF_PARTNER
} from './intervention-actions.constants';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button';
import {updateCurrentIntervention} from '../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {defaultKeyTranslate, formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {GenericObject} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {translatesMap} from '../utils/intervention-labels-map';

@customElement('intervention-actions')
export class InterventionActions extends LitElement {
  static get styles(): CSSResultArray {
    return [InterventionActionsStyles];
  }

  @property() actions: string[] = [];
  @property({type: String}) dir = 'ltr';
  interventionId!: number;
  activeStatus!: string;

  connectedCallback() {
    super.connectedCallback();
    this.dir = getComputedStyle(document.body).direction;
  }

  private actionsNamesMap = new Proxy(namesMap, {
    get(target: GenericObject<string>, property: string): string {
      return target[property] || property.replace('_', ' ');
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
      ${this.renderExport(exportActions)}${this.renderBackAction(backAction)}
      ${this.renderGroupedActions(mainAction, groupedActions)}
    `;
  }

  private renderExport(actions: string[]): TemplateResult {
    const preparedExportActions = actions.map((action: string) => ({
      name: this.actionsNamesMap[action],
      type: action
    }));
    return actions.length
      ? html`
          <export-intervention-data
            .exportLinks="${preparedExportActions}"
            .interventionId="${this.interventionId}"
          ></export-intervention-data>
        `
      : html``;
  }

  private renderBackAction(action?: string): TemplateResult {
    return action
      ? html`
          <paper-button class="main-button back-button" @click="${() => this.processAction(action)}">
            ${arrowLeftIcon} <span>${this.actionsNamesMap[action]}</span>
          </paper-button>
        `
      : html``;
  }

  private renderGroupedActions(mainAction: string, actions: string[]): TemplateResult {
    const withAdditional = actions.length && this.dir === 'ltr' ? ' with-additional' : '';
    const onlyCancel = !actions.length && mainAction === CANCEL ? ` cancel-background` : '';
    const className = `main-button${withAdditional}${onlyCancel}`;
    return mainAction
      ? html`
          <paper-menu-button
            horizontal-align="right"
            class="${className}"
            @click="${(event: MouseEvent) => event.stopImmediatePropagation()}"
          >
            <span
              slot="dropdown-trigger"
              @click="${(event: MouseEvent) => {
                event.stopImmediatePropagation();
                this.processAction(mainAction);
              }}"
            >
              ${this.actionsNamesMap[mainAction]}
            </span>
            ${this.getAdditionalTransitions(actions)}
          </paper-menu-button>
        `
      : html``;
  }

  private getAdditionalTransitions(actions?: string[]): TemplateResult {
    if (!actions || !actions.length) {
      return html``;
    }
    return html`
      <paper-icon-button slot="dropdown-trigger" class="option-button" icon="expand-more"></paper-icon-button>
      <div slot="dropdown-content">
        ${actions.map(
          (action: string) => html`
            <div class="other-options" @click="${() => this.processAction(action)}">
              ${this.actionsNamesMap[action]}
            </div>
          `
        )}
      </div>
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
        message = getTranslation('AMENDMENT_MERGE');
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
      default:
        btn = this.actionsNamesMap[action];
        message = getTranslation('ARE_YOU_SURE_PROMPT') + this.actionsNamesMap[action]?.toLowerCase() + ' ?';
    }
    return await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: message,
        confirmBtnText: btn
      }
    }).then(({confirmed}) => confirmed);
  }

  async processAction(action: string): Promise<void> {
    this.closeDropdown();

    if (!(await this.confirmAction(action))) {
      return;
    }
    const body = ACTIONS_WITH_INPUT.includes(action) ? await this.openActionsWithInputsDialogs(action) : {};
    if (body === null) {
      return;
    }

    const endpoint = getEndpoint(interventionEndpoints.interventionAction, {
      interventionId: this.interventionId,
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
        if (action === AMENDMENT_MERGE) {
          history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${intervention.id}/metadata`);
          window.dispatchEvent(new CustomEvent('popstate'));
        } else {
          getStore().dispatch(updateCurrentIntervention(intervention));
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

  private openCommentDialog(action: string): Promise<any> {
    return openDialog({
      dialog: 'reason-popup',
      dialogData: {
        popupTitle: `${this.actionsNamesMap[action]} reason`,
        label: `${this.actionsNamesMap[action]} comment`
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

  private openTermiantionDialog() {
    return openDialog({
      dialog: 'pd-termination',
      dialogData: {
        interventionId: this.interventionId
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
        interventionId: this.interventionId
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
    const element: PaperMenuButton | null = this.shadowRoot!.querySelector('paper-menu-button');
    if (element) {
      element.close();
    }
  }

  private openActionsWithInputsDialogs(action: string) {
    switch (action) {
      case CANCEL:
        return this.openCommentDialog(action);
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
}
