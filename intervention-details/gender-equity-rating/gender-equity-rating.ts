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
import {GenderEquityRatingPermissions} from './genderEquityRating.models';
import {Permission} from '../../common/models/intervention.types';
import {validateRequiredFields} from '../../utils/validation-helper';
import {getStore} from '../../utils/redux-store-access';
import {connect} from 'pwa-helpers/connect-mixin';
import {AnyObject} from '../../common/models/globals.types';
import {patchIntervention} from '../../common/actions';
import {isJsonStrMatch} from '../../utils/utils';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';

/**
 * @customElement
 */
@customElement('gender-equity-rating')
export class GenderEquityRatingElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
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

      <etools-content-panel show-expand-btn panel-title="Gender, Equity & Sustainability">
        <etools-loading loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${this.hideEditIcon(this.editMode, this.canEditAtLeastOneField)}"
            @tap="${this.allowEdit}"
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
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.gender)}
          </paper-radio-group>
          <div class="col col-6 pl-none">
            <paper-textarea
              label="Gender Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.gender_narrative}"
              ?required="${this.permissions.required.gender}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'gender_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.gender)}"
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
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.sustainability)}
          </paper-radio-group>
          <div class="col col-6 pl-none">
            <paper-textarea
              label="Sustainability Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.sustainability_narrative}"
              ?required="${this.permissions.required.sustainability}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'sustainability_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.sustainability)}"
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
            ${this._getRatingRadioButtonsTemplate(this.ratings, this.permissions.edit.equity)}
          </paper-radio-group>
          <div class="col col-6 pl-none">
            <paper-textarea
              label="Equity Narrative"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              max-rows="4"
              .value="${this.data.equity_narrative}"
              ?required="${this.permissions.required.equity}"
              @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'equity_narrative')}"
              ?readonly="${this.isReadonly(this.editMode, this.permissions.edit.equity)}"
            >
            </paper-textarea>
          </div>
        </div>

        <div
          class="layout-horizontal right-align row-padding-v"
          ?hidden="${this.hideActionButtons(this.editMode, this.canEditAtLeastOneField)}"
        >
          <paper-button class="default" @tap="${this.cancel}">
            Cancel
          </paper-button>
          <paper-button class="primary" @tap="${this.save}">
            Save
          </paper-button>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions!: Permission<GenderEquityRatingPermissions>;

  @property({type: Boolean})
  showLoading = false;

  @property({type: Array})
  ratings!: AnyObject[];

  stateChanged(state: any) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'details')) {
      return;
    }

    if (state.commonData.genderEquityRatings) {
      this.ratings = state.commonData.genderEquityRatings;
    }
    if (state.interventions.current) {
      const genderEquityRating = selectGenderEquityRating(state);
      if (!isJsonStrMatch(this.data, genderEquityRating)) {
        this.data = cloneDeep(genderEquityRating);
        this.originalData = cloneDeep(genderEquityRating);
      }
    }
    this.sePermissions(state);
  }

  private sePermissions(state: any) {
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

  validate() {
    return validateRequiredFields(this);
  }

  save() {
    if (!this.validate()) {
      return;
    }
    getStore()
      .dispatch(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
