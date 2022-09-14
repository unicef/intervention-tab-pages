import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {customElement, html, LitElement, property} from 'lit-element';
import {translate} from 'lit-translate';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {AsyncAction} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';

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
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('IMPORT_INFO')}
        comment-element="other-info"
        comment-description="Other Info"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, true)}</div>
        <div class="row-padding">Make sure the PD/SPD takes into account the information presented below.</div>
        <div class="row-padding">
          <paper-textarea
            id="otherInfo"
            label="Info"
            always-float-label
            placeholder="—"
            readonly
            .value="${this.data?.other_info}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'other_info')}"
          >
          </paper-textarea>
        </div>

        ${this.hideActionButtons(this.editMode, true)
          ? html``
          : html` <div class="layout-horizontal right-align row-padding">
              <paper-button class="default" @click="${this.cancel}">${translate('GENERAL.CANCEL')}</paper-button>
              <paper-button class="primary" @click="${this.saveUnresolved}"> Mark as resolved</paper-button>
            </div>`}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data!: {other_info: string};

  cancel() {
    this.editMode = false;
  }

  async areYouSure() {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'This information will be deleted as a result of this action. Are you sure?',
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
      .dispatch<AsyncAction>(
        // @ts-ignore
        patchIntervention({other_info: ''})
      )
      .then(() => {
        this.editMode = false;
      });
  }
}
