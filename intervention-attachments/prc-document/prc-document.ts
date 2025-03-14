import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import cloneDeep from 'lodash-es/cloneDeep';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {RootState} from '../../common/types/store.types';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import './prcDocument.models';
import './prcDocument.selectors';
import {selectPrcDocumentData, selectPrcDocumentPermissions} from './prcDocument.selectors';
import {PrcDocumentData, PrcDocumentPermissions} from './prcDocument.models';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, EtoolsEndpoint, Permission} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import CONSTANTS from '../../common/constants';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {patchIntervention} from '../../common/actions/interventions';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import UploadsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/uploads-mixin';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

/**
 * @customElement
 */
@customElement('prc-document')
export class PrcDocument extends CommentsMixin(ComponentBaseMixin(UploadsMixin(LitElement))) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="prc-doc" active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('PRC_REVIEW_DOC_TITLE')}
        comment-element="prc-document"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>
        <div class="row padding-v">
          <div class="col-6">
            <!-- PRC Review Document -->
            <etools-upload
              id="reviewDocUpload"
              label=${translate('PRC_REVIEW_DOC')}
              accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.txt"
              .fileUrl="${this.data.prc_review_attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.prc_review_attachment)}"
              .showDeleteBtn="${this.showPrcReviewDeleteBtn(this.data.status)}"
              @delete-file="${this._prcRevDocDelete}"
              @upload-started="${this._onUploadStarted}"
              @upload-finished="${this._prcRevDocUploadFinished}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
            >
            </etools-upload>
          </div>
        </div>
        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }

  @property({type: String})
  uploadEndpoint: string = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.attachmentsUpload).url;

  @property({type: Object})
  data!: PrcDocumentData;

  @property({type: Object})
  permissions!: Permission<PrcDocumentPermissions>;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'attachments')) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }

    this.data = selectPrcDocumentData(state);
    this.originalData = cloneDeep(this.data);

    const permissions = selectPrcDocumentPermissions(state);
    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
    super.stateChanged(state);
  }

  _prcRevDocUploadFinished(e: CustomEvent) {
    this._onUploadFinished(e.detail.success);
    if (e.detail.success) {
      const response = e.detail.success;
      this.data.prc_review_attachment = response.id;
      this.requestUpdate();
    }
  }

  _prcRevDocDelete(_e: CustomEvent) {
    this.data.prc_review_attachment = null;
    this._onUploadDelete();
  }

  showPrcReviewDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalData && !this.originalData.prc_review_attachment;
  }

  _isDraft(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() || status === '';
  }

  saveData() {
    return getStore()
      .dispatch<AsyncAction>(
        // @ts-ignore
        patchIntervention({prc_review_attachment: this.data.prc_review_attachment})
      )
      .then(() => {
        this._onUploadSaved();
        this.editMode = false;
      });
  }
}
