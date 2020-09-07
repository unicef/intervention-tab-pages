import {LitElement, html, TemplateResult, property, customElement, CSSResultArray} from 'lit-element';
import {prettyDate} from '../utils/date-utils';
import CONSTANTS from '../common/constants';
import '@unicef-polymer/etools-content-panel';
import '@unicef-polymer/etools-data-table';
import '@polymer/iron-icons';
import './intervention-attachment-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../utils/redux-store-access';
import {sharedStyles} from '../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {openDialog} from '../utils/dialog';
import {ReviewAttachment} from '../common/models/intervention.types';
import {AttachmentsListStyles} from './attachments-list.styles';
import {IdAndName} from '../common/models/globals.types';

@customElement('attachments-list')
export class AttachmentsList extends connect(getStore())(LitElement) {
  static get styles(): CSSResultArray {
    return [gridLayoutStylesLit];
  }
  @property() attachments: ReviewAttachment[] = [];
  @property() interventionStatus!: string;
  @property() showInvalid = true;
  @property() canEdit = true;
  @property() fileTypes: IdAndName[] = [];

  protected render(): TemplateResult {
    return html`
      ${AttachmentsListStyles}
      <style>
        ${sharedStyles}
      </style>

      <etools-content-panel class="content-section" .panelTitle="Attachments (${this.attachments.length})">
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
            @tap="${() => this.openAttachmentDialog()}"
          >
          </paper-icon-button>
        </div>

        ${this.attachments.length
          ? html`
              <etools-data-table-header no-collapse no-title>
                <etools-data-table-column class="col-2">
                  Date Uploaded
                </etools-data-table-column>
                <etools-data-table-column class="col-3">
                  Document Type
                </etools-data-table-column>
                <etools-data-table-column class="col-6">
                  Document
                </etools-data-table-column>
                <etools-data-table-column class="col-1 center-align">
                  Invalid
                </etools-data-table-column>
              </etools-data-table-header>

              ${this.attachments.map(
                (attachment) => html`
                  <etools-data-table-row
                    secondary-bg-on-hover
                    no-collapse
                    ?hidden="${!attachment.active && !this.showInvalid}"
                  >
                    <div slot="row-data" class="p-relative layout-horizontal editable-row">
                      <span class="col-data col-2">
                        ${prettyDate(attachment.created) || '-'}
                      </span>
                      <span class="col-data col-3">
                        ${this.getAttachmentType(attachment.type)}
                      </span>
                      <span class="col-data col-6">
                        <iron-icon icon="attachment" class="attachment"></iron-icon>
                        <span class="break-word file-label">
                          <!-- target="_blank" is there for IE -->
                          <a href="${attachment.attachment_document || attachment.attachment}" target="_blank" download>
                            ${this.getFileNameFromURL(attachment.attachment_document || attachment.attachment)}
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
                          @tap="${() => this.openAttachmentDialog(attachment)}"
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
    this.attachments = state.interventions?.current.attachments || [];
    this.interventionStatus = state.interventions?.current.status || '';
    this.canEdit = state.interventions?.current.permissions.edit.attachments || false;
    this.fileTypes = state.commonData.fileTypes || [];
  }

  openAttachmentDialog(attachment?: ReviewAttachment): void {
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

  getFileNameFromURL(url: string) {
    if (!url) {
      return '';
    }
    return url.split('?').shift()!.split('/').pop();
  }

  canEditAttachments() {
    return (
      this.interventionStatus !== CONSTANTS.STATUSES.Closed.toLowerCase() &&
      this.interventionStatus !== CONSTANTS.STATUSES.Terminated.toLowerCase()
    );
  }
}
