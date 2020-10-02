import {CSSResultArray, LitElement, TemplateResult, html, property, customElement} from 'lit-element';
import {GenericObject} from '../common/models/globals.types';
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
import {InterventionActionsStyles} from './intervention-actions.styles';
import {ACTIONS_WITH_COMMENT, BACK_ACTIONS, CANCEL, EXPORT_ACTIONS, namesMap} from './intervention-actions.constants';
import {PaperMenuButton} from '@polymer/paper-menu-button/paper-menu-button';
import {Intervention} from '../common/models/intervention.types';
import {updateCurrentIntervention} from '../common/actions';
import {getStore} from '../utils/redux-store-access';

@customElement('intervention-actions')
export class InterventionActions extends LitElement {
  static get styles(): CSSResultArray {
    return [InterventionActionsStyles];
  }

  @property() actions: string[] = [];
  interventionId!: number;
  activeStatus!: string;

  private actionsNamesMap = new Proxy(namesMap, {
    get(target: GenericObject<string>, property: string): string {
      return target[property] || property;
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
    const endpointUrl: string = getEndpoint(interventionEndpoints.intervention, {interventionId: this.interventionId})
      .url;
    return actions.length
      ? html`
          <export-intervention-data
            .exportLinks="${preparedExportActions}"
            .endpoint="${endpointUrl}"
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
    const withAdditional = actions.length ? ' with-additional' : '';
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
        btn = 'Send';
        message = 'Are you sure you want to send for signature?';
        break;
      case 'accept_review':
        btn = 'Send';
        message = 'Are you sure you want to send for Accept & Review?';
        break;
      case 'cancel':
        btn = 'Yes';
        message = 'Are you sure you want to ' + action + ' ?';
        break;
      case 'send_to_partner':
        btn = 'Yes';
        message = 'Are you sure you want to send to partner?';
        break;
      default:
        btn = action;
        message = 'Are you sure you want to ' + action + ' ?';
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
    const body = ACTIONS_WITH_COMMENT.includes(action) ? await this.openCommentDialog(action) : {};
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

      return {
        comment: response.comment
      };
    });
  }

  private closeDropdown(): void {
    const element: PaperMenuButton | null = this.shadowRoot!.querySelector('paper-menu-button');
    if (element) {
      element.close();
    }
  }
}
