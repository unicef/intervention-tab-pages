import {LitElement, TemplateResult, html, property, customElement, css} from 'lit-element';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, AsyncAction, GenericObject, InterventionReview} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {loadPrcMembersIndividualReviews} from '../../actions/officers-reviews';
import {REVIEW_ANSVERS, REVIEW_QUESTIONS} from '../../../intervention-review/review.const';
import {updateCurrentIntervention} from '../../actions/interventions';
import {getDifference} from '@unicef-polymer/etools-modules-common/dist/mixins/objects-diff';
import {cloneDeep} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import '@polymer/paper-radio-group';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-textarea';
import {formatDate, getTodayDateStr} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';

@customElement('review-checklist-popup')
export class ReviewChecklistPopup extends LitElement {
  static get styles() {
    return [
      gridLayoutStylesLit,
      buttonsStyles,
      css`
        :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-left: 0px !important;
        }
        paper-radio-button:first-child {
          padding-left: 0px !important;
        }
        .form-container {
          padding: 0 24px;
        }
        .likert-scale {
          padding-top: 16px;
          padding-bottom: 14px;
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
        :host paper-button {
          align-self: stretch;
          font-size: 14px;
        }
        paper-checkbox {
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
    this.approvePopup = data.approvePopup;
    this.rejectPopup = data.rejectPopup;
  }

  protected render(): TemplateResult {
    return html`
      ${sharedStyles}

      <etools-dialog
        no-padding
        keep-dialog-open
        opened
        size="lg"
        dialog-title="${translate('REVIEW_CHECKLIST')}"
        ?show-spinner="${this.requestInProcess}"
      >
        <div class="form-container">
          ${this.isOverallReview
            ? html`
                <div class="col col-12 pl-none">
                  <datepicker-lite
                    label="${translate('REVIEW_DATE_PRC')}"
                    .value="${this.review?.review_date || getTodayDateStr()}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) => this.dateHasChanged(e.detail)}"
                  >
                  </datepicker-lite>
                </div>
              `
            : ''}
          ${Object.entries(this.questions).map(([field, question]: [string, string], index: number) =>
            this.generateLikertScale(field as keyof InterventionReview, question, index)
          )}
          <div class="col col-12 pl-none">
            <paper-textarea
              label=${translate('APPROVAL_COMMENT')}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.review.overall_comment || ''}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail.value, 'overall_comment')}"
            >
            </paper-textarea>
          </div>
          ${this.isOverallReview
            ? html`
                <div class="col col-12 pl-none" ?hidden="${!this.isOverallReview}">
                  <paper-textarea
                    label=${translate('ACTIONS_LIST')}
                    always-float-label
                    class="w100"
                    placeholder="&#8212;"
                    max-rows="4"
                    .value="${this.review.actions_list || ''}"
                    @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail.value, 'actions_list')}"
                  >
                  </paper-textarea>
                </div>
              `
            : html` <paper-checkbox
                ?checked="${this.review?.overall_approval}"
                @checked-changed="${(e: CustomEvent) => this.valueChanged(e.detail.value, 'overall_approval')}"
              >
                ${translate('APPROVED_BY_PRC')}
              </paper-checkbox>`}
        </div>
        <div slot="buttons">
          <paper-button class="cancel-btn" @click="${() => this.close()}">${translate('GENERAL.CANCEL')}</paper-button>
          ${this.rejectPopup
            ? html`<paper-button class="error" @click="${() => this.saveReview()}">
                ${translate('REJECT')}
              </paper-button>`
            : html`<paper-button class="primary" @click="${() => this.saveReview()}">
                ${this.approvePopup ? translate('APPROVE') : translate('SAVE_REVIEW')}
              </paper-button>`}
        </div>
      </etools-dialog>
    `;
  }

  generateLikertScale(field: keyof InterventionReview, questionText: string, index: number): TemplateResult {
    return html`
      <div class="likert-scale pb-20">
        <div class="w100">
          <label class="paper-label">Q${index + 1}: ${questionText}</label>
        </div>
        <paper-radio-group
          selected="${this.review[field] || ''}"
          @selected-changed="${({detail}: CustomEvent) => this.valueChanged(detail.value, field)}"
        >
          ${Array.from(REVIEW_ANSVERS.entries()).map(
            ([key, text]: [string, string]) => html` <paper-radio-button name="${key}">${text}</paper-radio-button> `
          )}
        </paper-radio-group>
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
        const errorText = err?.response?.detail || 'Try again later';
        fireEvent(this, 'toast', {text: `Can not save review. ${errorText}`});
      })
      .finally(() => (this.requestInProcess = false));
  }

  close(confirmed = false): void {
    fireEvent(this, 'dialog-closed', {
      confirmed
    });
  }
}
