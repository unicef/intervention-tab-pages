import {LitElement, customElement, html, property, CSSResultArray, css} from 'lit-element';
import {fireEvent} from '../utils/fire-custom-event';
import {translate} from 'lit-translate';
import {getStore} from '../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState} from '../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../utils/common-methods';
import {GenericObject, InterventionReview} from '@unicef-polymer/etools-types';
import {get} from 'lodash-es';
import {gridLayoutStylesLit} from '../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../common/styles/button-styles';
import {getEndpoint} from '../utils/endpoint-helper';
import {interventionEndpoints} from '../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {updateCurrentIntervention} from '../common/actions/interventions';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-checkbox/paper-checkbox';
declare const moment: any;

const Types: GenericObject<string> = {
  prc: 'PRC Review',
  'non-prc': 'Non-PRC Review',
  'no-review': 'No Review Required'
};

/**
 * @customElement
 */
@customElement('intervention-review')
export class InterventionReviewTab extends connect(getStore())(LitElement) {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      buttonsStyles,
      css`
        *[hidden] {
          display: none;
        }
        .container {
          min-height: 4rem;
          align-items: center;
        }
        paper-checkbox {
          margin-right: 1rem;
        }
        .label {
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .value {
          font-size: 16px;
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin-right: 1.5rem;
          min-width: 110px;
        }
      `
    ];
  }
  @property() currentReviewState = false;
  @property() allowEdit = false;
  @property() canEditReview = false;
  @property() review: InterventionReview | null = null;
  private interventionId: number | null = null;

  get reviewCreatedDate(): string {
    return this.review ? moment(this.review.created).format('DD MMM YYYY') : '-';
  }

  render() {
    // language=HTML
    return html`
      <etools-content-panel
        class="content-section"
        panel-title="${translate('INTERVENTION_REVIEWS.INTERVENTION_REVIEW')}"
      >
        <div slot="panel-btns">
          <paper-icon-button @click="${() => (this.allowEdit = true)}" icon="create"> </paper-icon-button>
        </div>

        <div class="row-padding-v">
          <div ?hidden="${this.review}">${translate('INTERVENTION_REVIEWS.EMPTY_REVIEW')}</div>

          <div ?hidden="${!this.review}" class="container layout-horizontal">
            <div class="info-block">
              <div class="label">${translate('INTERVENTION_REVIEWS.REVIEW_CREATED')}</div>
              <div class="value">${this.reviewCreatedDate}</div>
            </div>
            <div class="info-block">
              <div class="label">${translate('INTERVENTION_REVIEWS.REVIEW_TYPE')}</div>
              <div class="value">${Types[this.review?.review_type || '']}</div>
            </div>
            <paper-checkbox
              ?checked="${this.currentReviewState}"
              ?disabled="${!this.allowEdit}"
              @checked-changed="${(e: CustomEvent) => this.updateField(e.detail.value)}"
            >
              ${translate('INTERVENTION_REVIEWS.OVERALL_APPROVAL')}
            </paper-checkbox>
          </div>

          <div class="layout-horizontal right-align" ?hidden="${!this.allowEdit}">
            <paper-button class="default" @click="${() => this.cancel()}">
              ${translate('GENERAL.CANCEL')}
            </paper-button>
            <paper-button class="primary" @click="${() => this.save()}"> ${translate('GENERAL.SAVE')} </paper-button>
          </div>
        </div>
      </etools-content-panel>
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  updateField(value: any): void {
    this.currentReviewState = value;
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'review')) {
      this.cancel();
      return;
    }
    if (!state.interventions.current) {
      return;
    }
    this.review = state.interventions.current.reviews[0] || null;
    this.currentReviewState = this.review?.overall_approval || false;
    this.interventionId = state.interventions.current.id;
    // disable edit on draft status
    const interventionStatus = get(state, 'interventions.current.status');
    const isDraft = !interventionStatus || interventionStatus === 'draft';
    if (!isDraft) {
      this.canEditReview = true;
    } else {
      this.canEditReview = false;
    }
  }

  save(): void {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'intervention-review'
    });
    const endpoint = getEndpoint(interventionEndpoints.interventionReview, {
      id: this.review!.id,
      interventionId: this.interventionId
    });
    sendRequest({
      endpoint,
      method: 'PATCH',
      body: {
        overall_approval: this.currentReviewState
      }
    })
      .then(({intervention}: any) => {
        getStore().dispatch(updateCurrentIntervention(intervention));
        this.allowEdit = false;
      })
      .catch(() => {
        fireEvent(this, 'toast', {text: 'Can not save approval. Try again later'});
      })
      .finally(() => {
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'intervention-review'
        });
      });
  }

  cancel() {
    this.allowEdit = false;
    this.currentReviewState = this.review?.overall_approval || false;
  }
}
