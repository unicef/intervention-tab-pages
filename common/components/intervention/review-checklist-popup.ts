import {LitElement, TemplateResult, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, AsyncAction, GenericObject, InterventionReview} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {loadPrcMembersIndividualReviews} from '../../actions/officers-reviews';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from './review.const';
import {updateCurrentIntervention} from '../../actions/interventions';
import {getDifference} from '@unicef-polymer/etools-modules-common/dist/mixins/objects-diff';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {formatDate, getTodayDateStr} from '@unicef-polymer/etools-utils/dist/date.util';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';

@customElement('review-checklist-popup')
export class ReviewChecklistPopup extends LitElement {
  static get styles() {
    return [
      layoutStyles,
      css`
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-inline-start: 0px !important;
        }
        .form-container {
          padding: 0 24px;
        }
        .likert-scale {
          padding: 15px;
          border-bottom: 1px solid var(--secondary-background-color);
        }
        div[slot='buttons'] {
          border-top: 1px solid var(--divider-color);
          margin: 0;
          padding: 8px;
          display: flex;
          align-items: inherit;
          justify-content: flex-end;
        }

        etools-checkbox {
          margin: 14px 0;
        }
      `
    ];
  }

  @property() review: Partial<InterventionReview> = {};
  @property() isOverallReview = false;
  @property() approvePopup = false;
  @property() rejectPopup = false;
  @property() requestInProcess = false;
  originalReview!: Partial<InterventionReview>;
  overallReview!: Partial<InterventionReview>;

  questions: Readonly<GenericObject<string>> = REVIEW_QUESTIONS;

  set dialogData(data: AnyObject) {
    if (!data) {
      return;
    }
    this.isOverallReview = data.isOverall;
    this.overallReview = getStore().getState().interventions.current!.reviews[0];
    const review = this.isOverallReview ? this.overallReview : data.review;
    this.originalReview = review || {};
    this.review = review ? cloneDeep(this.originalReview) : {overall_approval: true};
    if (!this.review?.review_date) {
      this.review.review_date = getTodayDateStr();
    }
    this.approvePopup = data.approvePopup;
    this.rejectPopup = data.rejectPopup;
  }

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}

      <etools-dialog
        no-padding
        keep-dialog-open
        size="lg"
        dialog-title="${translate('REVIEW_CHECKLIST')}"
        ?show-spinner="${this.requestInProcess}"
      >
        <div class="container-dialog">
          <div class="row">
            ${this.isOverallReview
              ? html`
                  <div class="col-12">
                    <datepicker-lite
                      class="col-md-4 col-sm-12"
                      label="${translate('REVIEW_DATE_PRC')}"
                      .value="${this.review?.review_date}"
                      selected-date-display-format="D MMM YYYY"
                      fire-date-has-changed
                      @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail)}"
                    >
                    </datepicker-lite>
                  </div>
                `
              : ''}
            ${Object.entries(this.questions).map(([field]: [string, string], index: number) =>
              this.generateLikertScale(field as keyof InterventionReview, index)
            )}
            <div class="col-12">
              <etools-checkbox
                ?checked="${this.review.is_recommended_for_approval}"
                @sl-change="${(e: any) => this.valueChanged(e.target.checked, 'is_recommended_for_approval')}"
              >
                ${translate('SIGN_BUDGET_OWNER')}
              </etools-checkbox>
            </div>
            <div class="col-12">
              <etools-textarea
                label=${translate('APPROVAL_COMMENT')}
                always-float-label
                class="w100"
                placeholder="&#8212;"
                max-rows="4"
                .value="${this.review.overall_comment || ''}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail.value, 'overall_comment')}"
              >
              </etools-textarea>
            </div>
            ${this.isOverallReview
              ? html`
                  <div class="col-12" ?hidden="${!this.isOverallReview}">
                    <etools-textarea
                      label=${translate('ACTIONS_LIST')}
                      always-float-label
                      class="w100"
                      placeholder="&#8212;"
                      max-rows="4"
                      .value="${this.review.actions_list || ''}"
                      @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail.value, 'actions_list')}"
                    >
                    </etools-textarea>
                  </div>
                `
              : html`<div class="col-12">
                  <etools-checkbox
                    ?checked="${this.review?.overall_approval}"
                    @sl-change="${(e: any) => this.valueChanged(e.target.checked, 'overall_approval')}"
                  >
                    ${translate('APPROVED_BY_PRC')}
                  </etools-checkbox>
                </div>`}
          </div>
        </div>
        <div slot="buttons">
          <etools-button variant="text" class="neutral" @click="${() => this.close()}"
            >${translate('GENERAL.CANCEL')}</etools-button
          >
          ${this.rejectPopup
            ? html`<etools-button variant="danger" @click="${() => this.saveReview()}">
                ${translate('REJECT')}
              </etools-button>`
            : html`<etools-button variant="primary" @click="${() => this.saveReview()}">
                ${this.approvePopup ? translate('APPROVE') : translate('SAVE_REVIEW')}
              </etools-button>`}
        </div>
      </etools-dialog>
    `;
  }

  generateLikertScale(field: keyof InterventionReview, index: number): TemplateResult {
    return html`
      <div class="likert-scale pb-20">
        <div class="w100">
          <label class="label">Q${index + 1}: ${translateValue(field, `REVIEW_QUESTIONS`)}</label>
        </div>
        <etools-radio-group
          value="${this.review[field] || ''}"
          @sl-change="${(e: any) => this.valueChanged(e.target.value, field)}"
        >
          ${Array.from(REVIEW_ANSVERS.entries()).map(
            ([key, text]: [string, string]) => html`
              <sl-radio value="${key}">${translateValue(text, 'REVIEW_ANSWERS')}</sl-radio>
            `
          )}
        </etools-radio-group>
      </div>
    `;
  }

  valueChanged(value: any, field: keyof InterventionReview): void {
    this.review[field] = value;
    this.requestUpdate();
  }

  dateHasChanged(detail: {date: Date}) {
    const newValue = detail.date ? formatDate(detail.date, 'YYYY-MM-DD') : null;
    this.valueChanged(newValue, 'review_date');
  }

  saveReview(): void {
    const interventionId = getStore().getState().app.routeDetails.params!.interventionId;
    const userId = getStore().getState().user.data!.user;
    const reviewId: number = this.overallReview.id as number;
    const endpoint = this.isOverallReview
      ? interventionEndpoints.interventionReview
      : interventionEndpoints.officerReviewData;

    const body = getDifference(this.originalReview, this.review);
    this.requestInProcess = true;
    sendRequest({
      method: 'PATCH',
      endpoint: getEndpoint(endpoint, {
        interventionId,
        userId,
        id: reviewId
      }),
      body
    })
      .then(({intervention}: any) => getStore().dispatch(updateCurrentIntervention(intervention)))
      .then(() =>
        !this.isOverallReview ? getStore().dispatch<AsyncAction>(loadPrcMembersIndividualReviews(reviewId)) : null
      )
      .then(() => this.close(true))
      .catch((err: any) => {
        const errorText = err?.response?.detail || getTranslation('TRY_AGAIN_LATER');
        fireEvent(this, 'toast', {text: `${getTranslation('CAN_NOT_SAVE_REVIEW')} ${errorText}`});
      })
      .finally(() => (this.requestInProcess = false));
  }

  close(confirmed = false): void {
    fireEvent(this, 'dialog-closed', {
      confirmed
    });
  }
}
