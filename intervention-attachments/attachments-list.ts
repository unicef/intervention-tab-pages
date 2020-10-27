import {LitElement, html, TemplateResult, property, customElement, CSSResultArray} from 'lit-element';
import {prettyDate} from '../utils/date-utils';
import CONSTANTS from '../common/constants';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-data-table';
import '@polymer/iron-icons';
import './intervention-attachment-dialog';
import {sharedStyles} from '../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {openDialog} from '../utils/dialog';
import {InterventionAttachment, Intervention} from '../common/models/intervention.types';
import {AttachmentsListStyles} from './attachments-list.styles';
import {IdAndName} from '../common/models/globals.types';
import {getFileNameFromURL, cloneDeep} from '../utils/utils';
import {CommentsMixin} from '../common/components/comments/comments-mixin';
import '../common/layout/are-you-sure';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {getEndpoint} from '../utils/endpoint-helper';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '../utils/redux-store-access';
import {updateCurrentIntervention} from '../common/actions';
import {pageIsNotCurrentlyActive} from '../utils/common-methods';
import get from 'lodash-es/get';

@customElement('attachments-list')
export class AttachmentsList extends CommentsMixin(LitElement) {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }
  @property() attachments: InterventionAttachment[] = [];
  @property() showInvalid = true;
  @property() canEdit = true;
  @property() fileTypes: IdAndName[] = [];
  @property({type: String}) deleteConfirmationMessage = 'Are you sure you want to delete this attachment?';
  private intervention!: Intervention;

  protected render(): TemplateResult {
    return html`
      <style>
        ${sharedStyles}
      </style>
      ${AttachmentsListStyles}

      <etools-content-panel
        class="content-section"
        .panelTitle="Attachments (${this.attachments.length})"
        comment-element="attachments"
        comment-description="Attachments"
      >
        <div slot="panel-btns" class="layout-horizontal">
          <paper-toggle-button
            id="showInvalid"
            ?checked="${this.showInvalid}"
            @iron-change="${(event: CustomEvent) =>
              (this.showInvalid = (event.currentTarget as HTMLInputElement).checked)}"
          >
            Show invalid
          </paper-toggle-button>

          <paper-icon-button
            icon="add-box"
            ?hidden="${!this.canEdit}"
            title="Add"
            @click="${() => this.openAttachmentDialog()}"
          >
          </paper-icon-button>
        </div>

        ${this.attachments.length
          ? html`
              <etools-data-table-header no-collapse no-title>
                <etools-data-table-column class="col-2"> Date Uploaded </etools-data-table-column>
                <etools-data-table-column class="col-3"> Document Type </etools-data-table-column>
                <etools-data-table-column class="col-6"> Document </etools-data-table-column>
                <etools-data-table-column class="col-1 center-align"> Invalid </etools-data-table-column>
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
                        <paper-icon-button
                          ?hidden="${!this.canEdit || !this.canEditAttachments()}"
                          icon="create"
                          @click="${() => this.openAttachmentDialog(attachment)}"
                        ></paper-icon-button>
                        <paper-icon-button
                          ?hidden="${!this.canEdit || !this.canDeleteAttachments()}"
                          icon="delete"
                          @click="${() => this.openDeleteConfirmation(attachment)}"
                        ></paper-icon-button>
                      </div>
                    </div>
                  </etools-data-table-row>
                `
              )}
            `
          : html`
              <div class="row-h">
                <p>There are no attachments added.</p>
              </div>
            `}
      </etools-content-panel>
    `;
  }

  stateChanged(state: any): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'attachments')) {
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
    return attachmentType ? attachmentType.name : '—';
  }

  async openDeleteConfirmation(attachment: InterventionAttachment) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: this.deleteConfirmationMessage,
        confirmBtnText: 'Yes'
      }
    }).then(({confirmed}) => {
      return confirmed;
    });
    if (confirmed) {
      this.deleteAttachment(attachment);
    }
  }

  deleteAttachment(attachment: InterventionAttachment) {
    const endpoint = getEndpoint(interventionEndpoints.updatePdAttachment, {
      id: attachment.intervention,
      attachment_id: attachment.id
    });

    sendRequest({
      endpoint,
      method: 'DELETE'
    })
      .then(() => {
        getStore().dispatch(updateCurrentIntervention(this.removeDeletedAttachment(this.intervention, attachment.id!)));
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  removeDeletedAttachment(intervention: Intervention, attachmentId: number) {
    intervention.attachments = intervention.attachments.filter((attach) => attach.id !== attachmentId);
    return intervention;
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
