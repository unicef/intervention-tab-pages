import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../../../etools-pages-common/styles/button-styles';
import {sharedStyles} from '../../../../etools-pages-common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import ComponentBaseMixin from '../../../../etools-pages-common/mixins/component-base-mixin';
import {selectGenderEquityRating, selectGenderEquityRatingPermissions} from './genderEquityRating.selectors';
import {GenderEquityRatingPermissions, GenderEquityRating} from './genderEquityRating.models';
import {getStore} from '../../../../etools-pages-common/utils/redux-store-access';
import {RootState} from '../../common/types/store.types';
import {patchIntervention} from '../../common/actions/interventions';
import {isJsonStrMatch} from '../../../../etools-pages-common/utils/utils';
import {pageIsNotCurrentlyActive, detailsTextareaRowsCount} from '../../../../etools-pages-common/utils/common-methods';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';

/**
 * @customElement
 */
@customElement('gender-equity-rating')
export class GenderEquityRatingElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.data || !this.ratings || !this.permissions) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }
        .pl-none {
          padding-left: 0px !important;
        }
        paper-radio-button:first-child {
          padding-left: 0px !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('GENDER_EQUITY_SUSTAINABILITY')}
        comment-element="gender-equity-sustainability"
        comment-description=${translate('GENDER_EQUITY_SUSTAINABILITY')}
      >
        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${this.hideEditIcon(this.editMode, this.canEditAtLeastOneField)}"
            @click="${this.allowEdit}"
            icon="create"
          >
          </paper-icon-button>
        </div>

        <div class="row-padding-v pb-20">
          <div class="w100">
            <label class="paper-label">${translate(translatesMap.gender_rating)}</label>
          </div>
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.gender_rating,
            'gender_rating',
            this.ratings,
            this.permissions.edit.gender_rating
          )}
          <div class="col col-12 pl-none">
            <paper-textarea
              label=${translate(translatesMap.gender_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.gender_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'gender_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.gender_narrative)}"
              ?required="${this.permissions.required.gender_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.gender_narrative)}"
            >
            </paper-textarea>
          </div>
        </div>

        <div class="row-padding-v pb-20">
          <div class="w100">
            <label class="paper-label">${translate(translatesMap.equity_rating)}</label>
          </div>
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.equity_rating,
            'equity_rating',
            this.ratings,
            this.permissions.edit.equity_rating
          )}
          <div class="col col-12 pl-none">
            <paper-textarea
              label=${translate(translatesMap.equity_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.equity_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'equity_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.equity_narrative)}"
              ?required="${this.permissions.required.equity_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.equity_narrative)}"
            >
            </paper-textarea>
          </div>
        </div>

        <div class="row-padding-v pb-20">
          <div class="w100">
            <label class="paper-label">${translate(translatesMap.sustainability_rating)}</label>
          </div>
          ${this._getRatingRadioButtonGroupTemplate(
            this.editMode,
            this.data.sustainability_rating,
            'sustainability_rating',
            this.ratings,
            this.permissions.edit.sustainability_rating
          )}
          <div class="col col-12 pl-none">
            <paper-textarea
              label=${translate(translatesMap.sustainability_narrative)}
              always-float-label
              class="w100"
              placeholder="&#8212;"
              .value="${this.data.sustainability_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'sustainability_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.sustainability_narrative)}"
              ?required="${this.permissions.required.sustainability_narrative}"
              maxlength="3000"
              rows="${detailsTextareaRowsCount(this.editMode)}"
              .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.sustainability_narrative)}"
            >
            </paper-textarea>
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
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
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
      ? html`<paper-radio-group
          selected="${ratingSelected}"
          @selected-changed="${({detail}: CustomEvent) => this.valueChanged(detail, ratingKey)}"
        >
          ${this._getRatingRadioButtonsTemplate(ratings, permission)}
        </paper-radio-group>`
      : html`<label>${ratingText}</label>`;
  }

  _getRatingRadioButtonsTemplate(ratings: LabelAndValue[], permission: boolean) {
    return ratings.map(
      (r: LabelAndValue) =>
        html`<paper-radio-button
          class="${this.isReadonly(this.editMode, permission) ? 'readonly' : ''}"
          name="${r.value}"
        >
          ${r.label}</paper-radio-button
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
}
