import {LitElement, html, TemplateResult, CSSResultArray} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import CONSTANTS from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@polymer/iron-icons';
import './intervention-attachment-dialog';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {
  InterventionAttachment,
  Intervention,
  IdAndName,
  AsyncAction,
  EtoolsEndpoint
} from '@unicef-polymer/etools-types';
import {AttachmentsListStyles} from './attachments-list.styles';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {getFileNameFromURL, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention} from '../../common/actions/interventions';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

@customElement('attachments-list')
export class AttachmentsList extends CommentsMixin(LitElement) {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }
  @property() attachments: InterventionAttachment[] = [];
  @property() showInvalid = true;
  @property() canEdit = true;
  @property() fileTypes: IdAndName[] = [];
  @property({type: String}) deleteConfirmationMessage = translate('DELETE_ATTACHMENTS_PROMPT') as unknown as string;
  private intervention!: Intervention;

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}
      <style>
        ${AttachmentsListStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>

      <etools-content-panel
        class="content-section"
        .panelTitle="${translate('ATTACHMENTS') as unknown as string} (${this.attachments.length})"
        comment-element="attachments"
      >
        <div slot="panel-btns" class="layout-horizontal">
          <sl-switch
            id="showInvalid"
            ?checked="${this.showInvalid}"
            @sl-change="${(event: CustomEvent) =>
              (this.showInvalid = (event.currentTarget as HTMLInputElement).checked)}"
          >
            ${translate('SHOW_INVALID')}
          </sl-switch>

          <sl-icon-button
            name="plus-square-fill"
            ?hidden="${!this.canEdit}"
            title=${translate('GENERAL.ADD')}
            @click="${() => this.openAttachmentDialog()}"
          >
          </sl-icon-button>
        </div>

        ${this.attachments.length
          ? html`
              <etools-data-table-header no-collapse no-title>
                <etools-data-table-column class="col-2">${translate('DATE_UPLOADED')}</etools-data-table-column>
                <etools-data-table-column class="col-3">${translate('DOC_TYPE')}</etools-data-table-column>
                <etools-data-table-column class="col-6">${translate('DOC')}</etools-data-table-column>
                <etools-data-table-column class="col-1 center-align">${translate('INVALID')}</etools-data-table-column>
              </etools-data-table-header>

              ${this.attachments.map(
                (attachment) => html`
                  <etools-data-table-row
                    secondary-bg-on-hover
                    no-collapse
                    ?hidden="${!attachment.active && !this.showInvalid}"
                  >
                    <div slot="row-data" class="p-relative layout-horizontal editable-row">
                      <span class="col-data col-2">${prettyDate(String(attachment.created)) || '-'}</span>
                      <span class="col-data col-3">${this.getAttachmentType(attachment.type!)}</span>
                      <span class="col-data col-6">
                        <iron-icon icon="attachment" class="attachment"></iron-icon>
                        <span class="break-word file-label">
                          <!-- target="_blank" is there for IE -->
                          <a href="${attachment.attachment_document || attachment.attachment}" target="_blank" download>
                            ${getFileNameFromURL(String(attachment.attachment_document || attachment.attachment))}
                          </a>
                        </span>
                      </span>
                      <span class="col-data col-1 center-align">
                        <span ?hidden="${!attachment.active}" class="placeholder-style">&#8212;</span>
                        <iron-icon icon="check" ?hidden="${attachment.active}"></iron-icon>
                      </span>
                      <div class="hover-block">
                        <sl-icon-button
                          ?hidden="${!this.canEdit || !this.canEditAttachments()}"
                          name="pencil-fill"
                          @click="${() => this.openAttachmentDialog(attachment)}"
                        ></sl-icon-button>
                        <sl-icon-button
                          ?hidden="${!this.canEdit || !this.canDeleteAttachments()}"
                          name="trash-fill"
                          @click="${() => this.openDeleteConfirmation(attachment)}"
                        ></sl-icon-button>
                      </div>
                    </div>
                  </etools-data-table-row>
                `
              )}
            `
          : html`
              <div class="row-h">
                <p>${translate('NO_ATTACHMENTS_ADDED')}</p>
              </div>
            `}
      </etools-content-panel>
    `;
  }

  stateChanged(state: any): void {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'attachments')) {
      return;
    }
    if (!state.interventions.current) {
      return;
    }

    this.intervention = cloneDeep(state.interventions.current);
    this.attachments = this.intervention.attachments || [];
    this.canEdit = this.intervention.permissions!.edit.attachments || false;

    this.fileTypes = state.commonData.fileTypes || [];
    super.stateChanged(state);
  }

  openAttachmentDialog(attachment?: InterventionAttachment): void {
    openDialog({
      dialog: 'intervention-attachment-dialog',
      dialogData: {attachment}
    });
  }

  getAttachmentType(type: number) {
    const fileTypes = !(this.fileTypes instanceof Array) ? [] : this.fileTypes;
    const attachmentType = fileTypes.find((t: IdAndName) => Number(t.id) === type);
    return attachmentType ? getTranslatedValue(attachmentType.name, 'FILE_TYPES') : '—';
  }

  async openDeleteConfirmation(attachment: InterventionAttachment) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: this.deleteConfirmationMessage,
        confirmBtnText: translate('CONFIRM_BTN_TEXT')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
    if (confirmed) {
      this.deleteAttachment(attachment);
    }
  }

  deleteAttachment(attachment: InterventionAttachment) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-attachment-remove'
    });

    const endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.updatePdAttachment, {
      id: attachment.intervention,
      attachment_id: attachment.id
    });

    sendRequest({
      endpoint,
      method: 'DELETE'
    })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention(String(this.intervention.id)));
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-attachment-remove'
        })
      );
  }

  canEditAttachments() {
    return (
      this.intervention.status !== CONSTANTS.STATUSES.Closed.toLowerCase() &&
      this.intervention.status !== CONSTANTS.STATUSES.Terminated.toLowerCase()
    );
  }

  canDeleteAttachments() {
    return this.intervention.status === CONSTANTS.STATUSES.Draft.toLowerCase();
  }
}
