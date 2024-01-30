import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {selectGenderEquityRating, selectGenderEquityRatingPermissions} from './genderEquityRating.selectors';
import {GenderEquityRatingPermissions, GenderEquityRating} from './genderEquityRating.models';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {RootState} from '../../common/types/store.types';
import {patchIntervention} from '../../common/actions/interventions';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {detailsTextareaRowsCount} from '../../utils/utils';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@unicef-polymer/etools-unicef/src/etools-radio/etools-radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 */
@customElement('gender-equity-rating')
export class GenderEquityRatingElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    if (!this.data || !this.ratings || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="ger" active></etools-loading>`;
    }
    // language=HTML
    return html`
     ${sharedStyles}
      <style>
       :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-inline-start: 0px !important;
        }

        sl-radio {
          margin-inline-end: 20px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        info-icon-tooltip {
          --iit-icon-size: 18px;
        }
        #iit-ger {
          --iit-margin: 8px 0 8px -15px;
          --iit-icon-size: 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('GENDER_EQUITY_SUSTAINABILITY')}
        comment-element="gender-equity-sustainability"
      >
        <div slot="after-title">
          <info-icon-tooltip
            id="iit-ger"
            .tooltipHtml="${this.getRatingInfoHtml()}"
          ></info-icon-tooltip>
        </div>
       <div slot="panel-btns">
          <etools-icon-button
            ?hidden="${this.hideEditIcon(this.editMode, this.canEditAtLeastOneField)}"
            @click="${this.allowEdit}"
            name="create"
          >
          </etools-icon-button>
        </div>

        <div class="row pb-20">
          <div class="col-12">
            <label class="label">${translate(translatesMap.gender_rating)}</label>
            <info-icon-tooltip id="iit-gender" ?hidden=${!this.editMode}
              .tooltipText=${translate('GENDER_RATING_INFO')}>
            </info-icon-tooltip>
          </div>
          <div class="col-12">
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.gender_rating,
            'gender_rating',
            this.ratings,
            this.permissions?.edit.gender_rating
          )}
          </div>
          <div class="col-12">
            <etools-textarea
              label=${translate(translatesMap.gender_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.gender_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'gender_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.gender_narrative)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.gender_narrative) ? -1 : undefined}"
              ?required="${this.permissions?.required.gender_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.gender_narrative)}"
            >
            </etools-textarea>
          </div>
        </div>

        <div class="row pb-20">
          <div class="col-12">
            <label class="label">${translate(translatesMap.equity_rating)}</label>
            <info-icon-tooltip id="iit-equity" ?hidden=${!this.editMode}
              .tooltipText=${translate('EQUITY_RATING_INFO')}>
            </info-icon-tooltip>
          </div>
          <div class="col-12">
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.equity_rating,
            'equity_rating',
            this.ratings,
            this.permissions?.edit.equity_rating
          )}
          </div>
          <div class="col-12">
            <etools-textarea
              label=${translate(translatesMap.equity_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.equity_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'equity_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.equity_narrative)}"
              tabindex="${this.isReadonly(this.editMode, this.permissions?.edit.equity_narrative) ? -1 : undefined}"
              ?required="${this.permissions?.required.equity_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.equity_narrative)}"
            >
            </etools-textarea>
          </div>
        </div>

        <div class="row pb-20">
          <div class="col-12">
            <label class="label">${translate(translatesMap.sustainability_rating)}</label>
            <info-icon-tooltip id="iit-sust" ?hidden=${!this.editMode}
              .tooltipText=${translate('SUSTAINABILITY_RATING_INFO')}>
            </info-icon-tooltip>
          </div>
          <div class="col-12">
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.sustainability_rating,
            'sustainability_rating',
            this.ratings,
            this.permissions?.edit.sustainability_rating
          )}
          </div>
          <div class="col-12">
            <etools-textarea
              label=${translate(translatesMap.sustainability_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.sustainability_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'sustainability_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions?.edit.sustainability_narrative)}"
              tabindex="${
                this.isReadonly(this.editMode, this.permissions?.edit.sustainability_narrative) ? -1 : undefined
              }"
              ?required="${this.permissions?.required.sustainability_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions?.edit?.sustainability_narrative)}"
            >
            </etools-textarea>
          </div>
        </div>

          ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<GenderEquityRatingPermissions>;

  @property({type: Array})
  ratings!: LabelAndValue[];

  @property({type: Object})
  data!: GenderEquityRating;

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
      return;
    }

    if (state.commonData.genderEquityRatings) {
      this.ratings = state.commonData.genderEquityRatings;
    }
    if (state.interventions.current) {
      this.setPermissions(state);
      const genderEquityRating = selectGenderEquityRating(state);
      if (!isJsonStrMatch(this.originalData, genderEquityRating)) {
        this.data = cloneDeep(genderEquityRating);
        this.originalData = cloneDeep(genderEquityRating);
      }
    }
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    const permissions = selectGenderEquityRatingPermissions(state);
    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
  }
  _getRatingRadioButtonGroupTemplate(
    editMode: boolean,
    ratingSelected: string,
    ratingKey: string,
    ratings: LabelAndValue[],
    permission: boolean
  ) {
    const ratingText = editMode ? '' : ratings.find((r) => r.value === ratingSelected)?.label || '';

    return editMode
      ? html`<etools-radio-group
          .value="${ratingSelected}"
          @sl-change="${(e: any) => this.valueChanged({value: e.target.value}, ratingKey)}"
        >
          ${this._getRatingRadioButtonsTemplate(ratings, permission)}
        </etools-radio-group>`
      : html`<label>${translateValue(ratingText, 'RATINGS')}</label>`;
  }

  _getRatingRadioButtonsTemplate(ratings: LabelAndValue[], permission: boolean) {
    return ratings.map(
      (r: LabelAndValue) =>
        html`<sl-radio class="${this.isReadonly(this.editMode, permission) ? 'readonly' : ''}" value="${r.value}">
          ${translateValue(r.label, 'RATINGS')}</sl-radio
        >`
    );
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }

    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      })
      .catch((error: any) => {
        console.log(error);
      });
  }

  getRatingInfoHtml() {
    return html`
      <style>
        .rating-info {
          display: flex;
          flex-direction: column;
          padding: 6px;
          margin: 10px 0px;
          width: 100%;
          box-sizing: border-box;
          border: solid 1px var(--secondary-background-color);
        }
        .no-bold {
          font-weight: normal;
        }
      </style>
      <div class="rating-info">
        <span>${translate('SUSTAINABILITY_NONE')}:</span>
        <span class="no-bold">${translate('SUSTAINABILITY_NONE_TOOLTIP')}</span>
      </div>
      <div class="rating-info">
        <span>${translate('SUSTAINABILITY_MARGINAL')}:</span>
        <span class="no-bold">${translate('SUSTAINABILITY_MARGINAL_TOOLTIP')}</span>
      </div>
      <div class="rating-info">
        <span>${translate('SUSTAINABILITY_SIGNIFICANT')}:</span>
        <span class="no-bold">${translate('SUSTAINABILITY_SIGNIFICANT_TOOLTIP')}</span>
      </div>
      <div class="rating-info">
        <span>${translate('SUSTAINABILITY_PRINCIPAL')}:</span>
        <span class="no-bold">${translate('SUSTAINABILITY_PRINCIPAL_TOOLTIP')}</span>
      </div>
    `;
  }
}
