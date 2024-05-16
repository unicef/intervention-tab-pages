import {LitElement, html, TemplateResult, CSSResultArray} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import CONSTANTS from '../../common/constants';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
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
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention} from '../../common/actions/interventions';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

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
  @property({type: Boolean}) lowResolutionLayout = false;
  private intervention!: Intervention;

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}
      <style>
        ${AttachmentsListStyles} ${dataTableStylesLit} :host {
          display: block;
          margin-bottom: 24px;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
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

          <etools-icon-button
            name="add-box"
            ?hidden="${!this.canEdit}"
            title=${translate('GENERAL.ADD')}
            @click="${() => this.openAttachmentDialog()}"
          >
          </etools-icon-button>
        </div>

        ${this.attachments.length
          ? html`
              <etools-data-table-header .lowResolutionLayout="${this.lowResolutionLayout}">
                <etools-data-table-column class="col-2">${translate('DATE_UPLOADED')}</etools-data-table-column>
                <etools-data-table-column class="col-3">${translate('DOC_TYPE')}</etools-data-table-column>
                <etools-data-table-column class="col-6">${translate('DOC')}</etools-data-table-column>
                <etools-data-table-column class="col-1">${translate('INVALID')}</etools-data-table-column>
              </etools-data-table-header>

              ${this.attachments.map(
                (attachment) => html`
                  <etools-data-table-row
                    .lowResolutionLayout="${this.lowResolutionLayout}"
                    secondary-bg-on-hover
                    no-collapse
                    ?hidden="${!attachment.active && !this.showInvalid}"
                  >
                    <div slot="row-data" class="p-relative layout-horizontal editable-row">
                      <span class="col-data col-2" data-col-header-label="${translate('DATE_UPLOADED')}">
                        ${prettyDate(String(attachment.created)) || '-'}
                      </span>
                      <span class="col-data col-3" data-col-header-label="${translate('DOC_TYPE')}">
                        ${this.getAttachmentType(attachment.type!)}
                      </span>
                      <span class="col-data col-6" data-col-header-label="${translate('DOC')}">
                        <etools-icon name="attachment" class="attachment"></etools-icon>
                        <span class="break-word file-label">
                          <!-- target="_blank" is there for IE -->
                          <a href="${attachment.attachment_document || attachment.attachment}" target="_blank" download>
                            ${getFileNameFromURL(String(attachment.attachment_document || attachment.attachment))}
                          </a>
                        </span>
                      </span>
                      <span class="col-data col-1" data-col-header-label="${translate('INVALID')}">
                        <span ?hidden="${!attachment.active}" class="placeholder-style">&#8212;</span>
                        <etools-icon name="check" ?hidden="${attachment.active}"></etools-icon>
                      </span>
                      <div class="hover-block">
                        <etools-icon-button
                          ?hidden="${!this.canEdit || !this.canEditAttachments()}"
                          name="create"
                          @click="${() => this.openAttachmentDialog(attachment)}"
                        ></etools-icon-button>
                        <etools-icon-button
                          ?hidden="${!this.canEdit || !this.canDeleteAttachments()}"
                          name="delete"
                          @click="${() => this.openDeleteConfirmation(attachment)}"
                        ></etools-icon-button>
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

    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.updatePdAttachment, {
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
