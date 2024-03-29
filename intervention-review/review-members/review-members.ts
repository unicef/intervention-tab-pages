import {LitElement, TemplateResult, html, customElement, property, CSSResultArray, css} from 'lit-element';
import {EtoolsEndpoint, InterventionReview, User} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../common/actions/interventions';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-button/paper-button';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {PRC_REVIEW} from '../../common/components/intervention/review.const';
import {addItemToListIfMissing} from '../../utils/utils';

@customElement('review-members')
export class ReviewMembers extends ComponentBaseMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      buttonsStyles,
      css`
        :host {
          display: block;
          margin-top: 24px;
        }
        datepicker-lite {
          margin-inline-end: 24px;
        }
        paper-button.notify {
          height: 40px;
          white-space: nowrap;
          flex: none;
          margin-inline-start: 24px;
        }
        .row-h:not(:first-child) {
          padding-top: 0;
        }
        datepicker-lite {
          min-width: 180px;
        }
        etools-dropdown-multi {
          max-width: initial;
        }
      `
    ];
  }
  @property() set review(review: InterventionReview) {
    this.originalData = review;
    this.data = cloneDeep(review);
    addItemToListIfMissing(this.data?.overall_approver, this.users, 'id');
  }

  users!: User[];

  @property() set usersList(users: User[]) {
    this.users = users;
    addItemToListIfMissing(this.data?.overall_approver, this.users, 'id');
  }

  get showNotifyButton(): boolean {
    return this.canEditAtLeastOneField && !this.editMode && this.data?.meeting_date && this.data?.prc_officers?.length;
  }
  private interventionId!: number;

  render(): TemplateResult {
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-content-panel class="content-section" panel-title="${translate('REVIEW_MEMBERS')}">
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v">
          <div class="row-h flex-c" ?hidden="${this.originalData?.review_type !== PRC_REVIEW}">
            <datepicker-lite
              label="${translate('MEETING_DATE')}"
              ?readonly="${this.isReadonly(this.editMode, true)}"
              .value="${this.data?.meeting_date}"
              selected-date-display-format="D MMM YYYY"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail, 'meeting_date')}"
            >
            </datepicker-lite>
          </div>
          <div class="row-h flex-c align-items-center" ?hidden="${this.originalData?.review_type !== PRC_REVIEW}">
            <etools-dropdown-multi
              label=${translate('REVIEWERS')}
              placeholder="&#8212;"
              .options="${this.users}"
              .selectedValues="${this.data?.prc_officers}"
              ?readonly="${this.isReadonly(this.editMode, this.canEditAtLeastOneField)}"
              option-label="name"
              option-value="id"
              ?trigger-value-change-event="${this.users.length}"
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                this.selectedItemsChanged(detail, 'prc_officers', 'id');
              }}"
            >
            </etools-dropdown-multi>
            <paper-button class="primary notify" @click="${this.sendNotification}" ?hidden="${!this.showNotifyButton}">
              ${translate('SEND_NOTIFICATIONS')}
            </paper-button>
          </div>
          <div class="row-h flex-c align-items-center">
            <etools-dropdown
              class="col-4"
              label=${translate('OVERALL_APPROVER')}
              placeholder="&#8212;"
              .options="${this.users}"
              .selected="${this.data?.overall_approver?.id}"
              ?readonly="${this.isReadonly(this.editMode, this.canEditAtLeastOneField)}"
              option-label="name"
              option-value="id"
              ?trigger-value-change-event="${this.users.length}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.selectedUserChanged(detail, 'overall_approver');
              }}"
            >
            </etools-dropdown>
          </div>

          <div class="row-padding-h">${this.renderActions(this.editMode, true)}</div>
        </div>
      </etools-content-panel>
    `;
  }

  saveData(): Promise<void> {
    const endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.interventionReview, {
      id: this.data!.id,
      interventionId: this.interventionId
    });
    return sendRequest({
      endpoint,
      method: 'PATCH',
      body: {
        prc_officers: this.data.prc_officers || [],
        overall_approver: this.data.overall_approver?.id || null,
        meeting_date: this.data.meeting_date || null
      }
    })
      .then(({intervention}: any) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.editMode = false;
      })
      .catch((err: any) => {
        const errorText = err?.response?.detail || getTranslation('TRY_AGAIN_LATER');
        fireEvent(this, 'toast', {text: `${getTranslation('CAN_NOT_SAVE_REVIEW')} ${errorText}`});
      });
  }

  sendNotification(): void {
    const endpoint = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.sendReviewNotification, {
      id: this.data!.id,
      interventionId: this.interventionId
    });
    sendRequest({
      endpoint,
      method: 'POST'
    })
      .then(() => {
        fireEvent(this, 'toast', {text: getTranslation('NOTIFICATION_SENT_SUCCESS')});
      })
      .catch((err: any) => {
        const errorText = err?.response?.detail || getTranslation('TRY_AGAIN_LATER');
        fireEvent(this, 'toast', {text: `${getTranslation('CAN_NOT_SEND_NOTIFICATION')} ${errorText}`});
      });
  }
}
