import {LitElement, TemplateResult, html, CSSResultArray, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {EtoolsEndpoint, InterventionReview, User} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {updateCurrentIntervention} from '../../common/actions/interventions';

import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import cloneDeep from 'lodash-es/cloneDeep';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import {PRC_REVIEW} from '../../common/components/intervention/review.const';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import {addItemToListIfMissing} from '../../utils/utils';

@customElement('review-members')
export class ReviewMembers extends ComponentBaseMixin(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      layoutStyles,
      css`
        :host {
          display: block;
          margin-top: 24px;
        }
        datepicker-lite {
          margin-inline-end: 24px;
        }

        .row:not(:first-child) {
          padding-top: 0;
        }
        datepicker-lite {
          min-width: 180px;
        }
        etools-dropdown-multi {
          max-width: initial;
        }
        etools-button::part(base) {
          padding: 0 10px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .flex-1 {
          flex: 1 1 0%;
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

        <div class="row" ?hidden="${this.originalData?.review_type !== PRC_REVIEW}">
          <datepicker-lite
            class="col-md-4 col-sm-12"
            label="${translate('MEETING_DATE')}"
            ?readonly="${this.isReadonly(this.editMode, true)}"
            .value="${this.data?.meeting_date}"
            selected-date-display-format="D MMM YYYY"
            fire-date-has-changed
            @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail, 'meeting_date')}"
          >
          </datepicker-lite>
        </div>
        <div class="row" ?hidden="${this.originalData?.review_type !== PRC_REVIEW}">
          <div class="col-12 layout-horizontal align-items-center">
            <div class="flex-1">
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
            </div>
            <div>
              <etools-button variant="primary" @click="${this.sendNotification}" ?hidden="${!this.showNotifyButton}">
                ${translate('SEND_NOTIFICATIONS')}
              </etools-button>
            </div>
          </div>
        </div>
        <div class="row">
          <etools-dropdown
            class="col-md-4 col-sm-12"
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

        ${this.renderActions(this.editMode, true)}
      </etools-content-panel>
    `;
  }

  saveData(): Promise<void> {
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.interventionReview, {
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
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.sendReviewNotification, {
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
