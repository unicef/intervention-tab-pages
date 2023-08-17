import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {translate, get as getTranslation} from 'lit-translate';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {AsyncAction} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {patchIntervention} from './common/actions/interventions';

@customElement('unresolved-other-info-review')
export class UnresolvedOtherInfo extends ComponentBaseMixin(LitElement) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }
        etools-content-panel::part(ecp-header) {
          background-color: var(--light-error-color);
        }
      </style>
      <etools-content-panel show-expand-btn panel-title=${translate('IMPORT_INFO')} comment-element="other-info">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.editPermissions)}</div>
        <div class="row-padding">${translate('MAKE_SURE_OTHER_INFO')}</div>
        <div class="row-padding">
          <etools-textarea
            id="otherInfo"
            label="${translate('INFO')}"
            always-float-label
            placeholder="—"
            readonly
            .value="${this.data?.other_info}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_info')}"
          >
          </etools-textarea>
        </div>

        ${this.hideActionButtons(this.editMode, this.editPermissions)
          ? html``
          : html` <div class="layout-horizontal right-align row-padding">
              <paper-button class="default" @click="${this.cancel}">${translate('GENERAL.CANCEL')}</paper-button>
              <paper-button class="primary" @click="${this.areYouSure}"> ${translate('MARK_AS_RESOLVED')}</paper-button>
            </div>`}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data!: {other_info: string};

  @property({type: Boolean})
  editPermissions!: boolean;

  cancel() {
    this.editMode = false;
  }

  async areYouSure() {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: getTranslation('IMPORT_INFO_WILL_BE_DELETED_AS_A_RESULT'),
        confirmBtnText: translate('DELETE'),
        cancelBtnText: translate('CANCEL')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.saveUnresolved();
    }
  }

  saveUnresolved() {
    getStore()
      .dispatch<AsyncAction>(patchIntervention({other_info: ''}))
      .then(() => {
        this.editMode = false;
      });
  }
}
