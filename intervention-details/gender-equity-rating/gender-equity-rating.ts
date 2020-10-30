import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-radio-group';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '../../common/styles/button-styles';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {selectGenderEquityRating, selectGenderEquityRatingPermissions} from './genderEquityRating.selectors';
import {GenderEquityRatingPermissions, GenderEquityRating} from './genderEquityRating.models';
import {getStore} from '../../utils/redux-store-access';
import {RootState} from '../../common/types/store.types';
import {patchIntervention} from '../../common/actions';
import {isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, Permission} from '@unicef-polymer/etools-types';

/**
 * @customElement
 */
@customElement('gender-equity-rating')
export class GenderEquityRatingElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.data || !this.ratings) {
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
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title="Gender, Equity & Sustainability"
        comment-element="gender-equity-sustainability"
        comment-description="Gender, Equity & Sustainability"
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
            <label class="paper-label">Gender Rating</label>
          </div>
          <paper-radio-group
            selected="${this.data.gender_rating}"
            @selected-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'gender_rating')}"
          >
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.gender_rating)}
          </paper-radio-group>
          <div class="col col-12 pl-none">
            <paper-textarea
              label="Gender Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.gender_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'gender_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.gender_narrative)}"
            >
            </paper-textarea>
          </div>
        </div>
        <div class="row-padding-v pb-20">
          <div class="w100">
            <label class="paper-label">Sustainability Rating</label>
          </div>
          <paper-radio-group
            .selected="${this.data.sustainability_rating}"
            @selected-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'sustainability_rating')}"
          >
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.sustainability_rating)}
          </paper-radio-group>
          <div class="col col-12 pl-none">
            <paper-textarea
              label="Sustainability Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.sustainability_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'sustainability_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.sustainability_narrative)}"
            >
            </paper-textarea>
          </div>
        </div>
        <div class="row-padding-v pb-20">
          <div class="w100">
            <label class="paper-label">Equity Rating</label>
          </div>
          <paper-radio-group
            .selected="${this.data.equity_rating}"
            @selected-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'equity_rating')}"
          >
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.equity_rating)}
          </paper-radio-group>
          <div class="col col-12 pl-none">
            <paper-textarea
              label="Equity Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.equity_narrative}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'equity_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.equity_narrative)}"
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
  ratings!: AnyObject[];

  @property({type: Object})
  data!: GenderEquityRating;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (state.commonData.genderEquityRatings) {
      this.ratings = state.commonData.genderEquityRatings;
    }
    if (state.interventions.current) {
      const genderEquityRating = selectGenderEquityRating(state);
      if (!isJsonStrMatch(this.originalData, genderEquityRating)) {
        this.data = cloneDeep(genderEquityRating);
        this.originalData = cloneDeep(genderEquityRating);
      }
    }
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    const permissions = selectGenderEquityRatingPermissions(state);
    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
      this.set_canEditAtLeastOneField(this.permissions.edit);
    }
  }

  _getRatingRadioButtonsTemplate(ratings: AnyObject[], permission: boolean) {
    return ratings.map(
      (r: AnyObject) =>
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
