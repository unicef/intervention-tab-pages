/* eslint-disable lit-a11y/click-events-have-key-events */
import {CSSResultArray, LitElement, TemplateResult, html, property, customElement} from 'lit-element';
import {arrowLeftIcon} from '../common/styles/app-icons';
import '@polymer/paper-button';
import '@polymer/paper-menu-button';
import '@polymer/paper-icon-button';
import '../common/layout/export-intervention-data';
import './reason-popup';
import {getEndpoint} from '../utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../utils/fire-custom-event';
import {openDialog} from '../utils/dialog';
import '../common/layout/are-you-sure';
import '../common/components/intervention/pd-termination';
import {InterventionActionsStyles} from './intervention-actions.styles';
import {ACTIONS_WITH_INPUT, BACK_ACTIONS, CANCEL, EXPORT_ACTIONS, namesMap} from './intervention-actions.constants';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button';
import {updateCurrentIntervention} from '../common/actions/interventions';
import {getStore} from '../utils/redux-store-access';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {GenericObject} from '@unicef-polymer/etools-types';
import {Intervention} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

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
          <paper-button class="${className}" @click="${() => this.processAction(mainAction)}">
            ${this.actionsNamesMap[mainAction]} ${this.getAdditionalTransitions(actions)}
          </paper-button>
        `
      : html``;
  }

  private getAdditionalTransitions(actions?: string[]): TemplateResult {
    if (!actions || !actions.length) {
      return html``;
    }
    return html`
      <paper-menu-button horizontal-align="right" @click="${(event: MouseEvent) => event.stopImmediatePropagation()}">
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
      </paper-menu-button>
    `;
  }

  async confirmAction(action: string) {
    let message = '';
    let btn = '';
    switch (action) {
      case 'signature':
        btn = getTranslation('SEND');
        message = getTranslation('SEND_FOR_SIGNATURE');
        break;
      case 'accept_review':
        btn = getTranslation('SEND');
        message = getTranslation('SEND_FOR_ACCEPT_REVIEW');
        break;
      case 'cancel':
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('CANCEL_PROMPT');
        break;
      case 'send_to_partner':
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('SEND_TO_PARTNER_PROMPT');
        break;
      case 'send_to_unicef':
        btn = getTranslation('GENERAL.YES');
        message = getTranslation('SEND_TO_UNICEF_PROMPT');
        break;
      case 'terminate':
        btn = getTranslation('CONTINUE');
        message = getTranslation('TERMINATE_PROMPT');
        break;
      default:
        btn = this.actionsNamesMap[action];
        message =
          getTranslation('ARE_YOU_SURE_PROMPT') +
          this.actionsNamesMap[action]?.toLowerCase() +
          ' ?';
    }
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: message,
        confirmBtnText: btn
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    return confirmed;
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
        getStore().dispatch(updateCurrentIntervention(intervention));
      })
      .finally(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'intervention-actions'
        });
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
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

  private closeDropdown(): void {
    const element: PaperMenuButton | null = this.shadowRoot!.querySelector('paper-menu-button');
    if (element) {
      element.close();
    }
  }

  private openActionsWithInputsDialogs(action: string) {
    switch (action) {
      case 'cancel':
        return this.openCommentDialog(action);
      case 'terminate':
        return this.openTermiantionDialog();
      default:
        return;
    }
  }
}
